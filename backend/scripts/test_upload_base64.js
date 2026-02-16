(async ()=>{
  try{
    const res = await fetch('https://sumit-panchal-qa-portfolio.onrender.com/api/blogs/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'https://lifeofthecoders.github.io' },
      body: JSON.stringify({ imageBase64: 'data:text/plain;base64,dGVzdA==' })
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY', text);
  }catch(e){
    console.error('ERROR', e);
  }
})();
