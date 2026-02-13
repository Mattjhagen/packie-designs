import React, { useState } from 'react'

export default function App() {
  const [html, setHtml] = useState('<h1>Hello World</h1>')

  const save = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/site/create', { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer '+token }, body: JSON.stringify({ name: 'react-site', html }) })
    const data = await res.json()
    alert(JSON.stringify(data))
  }

  return (
    <div style={{padding:20}}>
      <h1>Visual Studio (React)</h1>
      <div style={{display:'flex',gap:12}}>
        <textarea value={html} onChange={e=>setHtml(e.target.value)} style={{width:'60%',height:400}} />
        <div style={{flex:1}}>
          <button onClick={save}>Save</button>
          <h3>Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: html }} style={{border:'1px solid #ddd',padding:12}} />
        </div>
      </div>
    </div>
  )
}
