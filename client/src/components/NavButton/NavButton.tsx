import React from 'react'

type NavButtonProps = {
    title: string;
    href: string | undefined;
};

const NavButton = (props : NavButtonProps) => {
  return (
    <button>
      <a href={props.href}>
        {props.title}
      </a>
    </button>
  );
}

export default NavButton