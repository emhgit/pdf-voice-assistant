import React from 'react'

type ButtonProps = {
    title: string;
    href: string | null;
};

const Button = (props : ButtonProps) => {
  return (
    <button>
        {props.title}
    </button>
  );
}

export default Button