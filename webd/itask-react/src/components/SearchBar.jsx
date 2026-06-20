import React from 'react'
import { HiSearch } from 'react-icons/hi'
import { IoClose } from 'react-icons/io5'

const SearchBar = ({ searchQuery, onSearch }) => {
  return (
    <div style={{ position: 'relative' }}>
      <HiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }} />
      <input
        type='text'
        placeholder='Search tasks...'
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className='todo-input'
        style={{ width: '100%', borderRadius: '12px', padding: '10px 40px 10px 42px', fontSize: '14px', fontWeight: 500 }}
      />
      {searchQuery && (
        <button
          onClick={() => onSearch('')}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '16px', display: 'flex', alignItems: 'center',
          }}
        >
          <IoClose />
        </button>
      )}
    </div>
  )
}

export default SearchBar
