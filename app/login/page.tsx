"use client";
import React, { useEffect , useState} from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUser } from "../contexts/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const { user, setUser} = useUser() || { user: null, setUser: () => {} };
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const data = {
        email: email,
        password: password
    };
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        const response = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        if(response.ok) {
            const userData = await response.json()
            console.log(userData.session)
            setUser(userData.session)
            console.log('Login successful',user)
            router.push('/smartSearch')
        }
    } catch(error) {
        console.log('Error submitting form', error)
    }
    
  };
  const handleSignUpClick = () => {
    router.push("/signup");
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8  dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome Back to Brain Cloud
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Please login to continue
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="your-email@domain.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)inset,0px-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Login &rarr;
          <BottomGradient />
        </button>
      </form>

      {/* Added link to signup */}
      <div className="text-center mt-4">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{" "}
          <button
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            onClick={handleSignUpClick}
          >
            Sign Up
          </button>
        </span>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
