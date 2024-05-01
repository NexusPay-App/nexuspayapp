/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // const router = useRouter();

  useEffect(() => {
    toast.error(error.message);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <h2>Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
