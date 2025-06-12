import { Link } from "react-router-dom";

type NavButtonProps = {
  title: string;
  href: string | undefined;
};

const NavButton = (props: NavButtonProps) => {
  return (
    <button>
      <Link to={"/" + props.href}>{props.title}</Link>
    </button>
  );
};

export default NavButton;
