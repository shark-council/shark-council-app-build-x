"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import { ClassValue } from "clsx";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "../ui/spinner";

const AGENT_IMAGES = [
  "https://shark-council-app-build-x.vercel.app/images/avatars/great-white-shark.png",
  "https://shark-council-app-build-x.vercel.app/images/avatars/hammerhead-shark.png",
  "https://shark-council-app-build-x.vercel.app/images/avatars/megalodon-shark.png",
  "https://shark-council-app-build-x.vercel.app/images/avatars/tiger-shark.png",
  "https://shark-council-app-build-x.vercel.app/images/avatars/whale-shark.png",
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  endpoint: z.string().url("Must be a valid URL"),
  image: z.string().min(1, "Please select an avatar"),
});

type FormValues = z.infer<typeof schema>;

export function AgentNewForm({ className }: { className?: ClassValue }) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { image: AGENT_IMAGES[0] },
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const selectedImage = useWatch({ control, name: "image" });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/erc8004", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success("Shark listed!");
      reset();
      router.push("/");
    } catch {
      toast.error("Failed to list shark");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Name</label>
        <Input placeholder="Agent name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe what this agent does..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Endpoint</label>
        <Input
          placeholder="https://your-agent-endpoint.com"
          {...register("endpoint")}
        />
        {errors.endpoint && (
          <p className="text-sm text-destructive">{errors.endpoint.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Avatar</label>
        <div className="flex gap-3">
          {AGENT_IMAGES.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setValue("image", url, { shouldValidate: true })}
              className={cn(
                "rounded-xl border-2 p-1 transition-colors",
                selectedImage === url
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Agent avatar option"
                className="size-16 rounded-lg"
              />
            </button>
          ))}
        </div>
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Spinner />}
        List a Shark
      </Button>
    </form>
  );
}
