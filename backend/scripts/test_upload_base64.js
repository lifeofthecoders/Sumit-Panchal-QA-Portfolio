(async ()=>{
  try{
    const res = await fetch('https://sumit-panchal-qa-portfolio.onrender.com/api/blogs/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'https://lifeofthecoders.github.io' },
      body: JSON.stringify({ imageBase64: 'data:text/plain;base64,dGVzdA==' })
    });
    const text = await res.text();
  }catch(e){
    console.error('ERROR', e);
  }
})();
