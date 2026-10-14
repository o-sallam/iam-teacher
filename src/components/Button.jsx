import React from 'react'

function Button(props) {
  return (
    <button type="button" {...props}>
      {props.children}
    </button>
  )
}

export default Button