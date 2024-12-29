import { Cover } from "@/components/ui/cover";
import Image from "next/image";
export default function Page() {   
    return (
        <div className="w-full bg-grid-black/[0.2] dark:bg-grid-white/[0.2]">

            <div className="mx-auto max-w-7xl">

            <h1 className="text-5xl text-center mt-16 font-extrabold">
                Build your AI powered <br />second brain using <Cover>Brain Cloud</Cover>
            </h1>
            
            <Image
                src="/output.png"
                alt="Hero"
                width={500}
                height={500}
                className="mx-auto mt-16"
            />


            </div>
        </div>
    );
}