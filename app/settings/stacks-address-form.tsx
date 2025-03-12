'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateStacksAddress } from '@/app/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';

interface StacksAddressFormProps {
  currentAddress?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          Save
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function StacksAddressForm({ currentAddress }: StacksAddressFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(currentAddress || '');

  async function handleSubmit(formData: FormData) {
    const result = await updateStacksAddress(formData);

    if (result.success) {
      // toast({
      //   title: "Address updated",
      //   description: "Your Stacks address has been successfully updated.",
      // });
      setIsEditing(false);
    } else {
      // toast({
      //   title: "Error",
      //   description: result.error || "Failed to update Stacks address.",
      //   variant: "destructive",
      // });
    }
  }

  if (!isEditing && !currentAddress) {
    return (
      <Button onClick={() => setIsEditing(true)}>
        Connect Stacks Address
      </Button>
    );
  }

  if (!isEditing) {
    return (
      <Button variant="outline" onClick={() => setIsEditing(true)}>
        Update Address
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          name="stacksAddress"
          placeholder="SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1"
          required
          pattern="^SP[0-9A-Z]{33,}$"
          title="Stacks address must start with SP followed by at least 33 alphanumeric characters"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setAddress(currentAddress || '');
            }}
          >
            Cancel
          </Button>
          <SubmitButton />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter your Stacks (STX) wallet address. Your address should start with SP followed by alphanumeric characters.
      </p>
    </form>
  );
}