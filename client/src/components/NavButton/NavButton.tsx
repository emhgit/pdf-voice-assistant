import { Link } from "react-router-dom";

type NavButtonProps = {
  title: string;
  href: string | undefined;
};

const NavButton = (props: NavButtonProps) => {
  return (
    <button className="bg-gray-100 p-1 font-bold">
      <Link to={"/" + props.href}>{props.title}</Link>
    </button>
  );
};

export default NavButton;
