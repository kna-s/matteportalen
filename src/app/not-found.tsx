import Link from "next/link";
import Mascot from "@/components/Mascot";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="flex justify-center">
        <Mascot mood="forvanad" size={140} />
      </div>
      <p className="mt-2 font-serif text-6xl font-bold text-navy">404</p>
      <h1 className="mt-1 text-2xl font-bold">Hoppsan, sidan finns inte</h1>
      <p className="mt-2 text-muted">Sigge letade överallt men hittade den inte. Den kanske har flyttat, eller så blev det ett litet stavfel.</p>
      <Link href="/" className="btn-accent mt-6">
        Till startsidan
      </Link>
    </div>
  );
}
