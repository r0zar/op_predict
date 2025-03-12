'use server';

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for validating Stacks address
const stacksAddressSchema = z.string().refine(
  (value) => /^SP[0-9A-Z]{33,}$/.test(value),
  {
    message: "Invalid Stacks address format. Must start with 'SP' followed by 33+ alphanumeric characters",
  }
);

export async function updateStacksAddress(formData: FormData) {
  try {
    const client = await clerkClient();

    // Get the current user - using currentUser() instead of auth()
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    
    // Get the Stacks address from the form
    const stacksAddress = formData.get('stacksAddress') as string;
    
    // Validate the Stacks address
    try {
      stacksAddressSchema.parse(stacksAddress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: "Invalid Stacks address" };
    }
    
    // Prepare the updated metadata
    const currentMetadata = user.publicMetadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      stacksAddress
    };
    
    // Update the user's metadata
    await client.users.updateUser(user.id, {
      publicMetadata: updatedMetadata,
    });
    
    // Revalidate the settings page
    revalidatePath('/settings');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating Stacks address:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}