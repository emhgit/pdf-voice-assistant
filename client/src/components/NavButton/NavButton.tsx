import { Link } from "react-router-dom";

type NavButtonProps = {
  title: string;
  href: string | undefined;
};

const NavButton = (props: NavButtonProps) => {
  return (
    <button className="bg-gray-100 px-3 py-2 rounded-md font-bold">
      <Link to={"/" + props.href}>{props.title}</Link>
    </button>
  );
};

export default NavButton;
