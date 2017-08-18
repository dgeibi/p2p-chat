import React from 'react'

const Text = ({ username, tag, text, myName }) =>
  <div
    style={{
      marginBottom: '16px',
      padding: '8px 48px 8px 38px',
      borderRadius: '4px',
      color: 'rgba(0,0,0,.65)',
      border: '1px solid #eee',
      wordBreak: 'break-all',
    }}
  >
    <span
      style={{
        color: '#222',
      }}
    >
      {username ? `${username} [${tag.slice(0, 5)}]` : myName}:{' '}
    </span>
    {text}
  </div>

export default Text
