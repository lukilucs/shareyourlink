import { Logo } from "../logo";
import Link from "next/link";

export const NavBar = () => {
  return (
    <>
      <nav className="w-full flex justify-center pt-5 pb-8">
        <Link href="/">
          <Logo size="3xl" sizeMd="6xl" />
        </Link>
      </nav>
      <div className="mx-auto w-4/5 border-b-2 border-primary"></div>
    </>
  );
};
