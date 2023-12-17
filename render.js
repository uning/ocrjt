
const selButton = document.getElementById('selBtn')
const titleInput = document.getElementById('titleInput')


document.getElementById('procssBtn').addEventListener('click', () => {
  const dir =   document.getElementById('selDir').innerText
  if(dir === '未选择'){
    alert("请选择目录");
    return;
  }
  //console.log('process dir:web',dir)
  window.electronAPI.process(dir)
})

selButton.addEventListener('click', async () => {
  const dirPath = await window.electronAPI.openDir()
  document.getElementById('selDir').innerText = dirPath
})

function showDir(){
  const dir =  document.getElementById('outDir').value ;
  window.electronAPI.showDir(dir);
}



//eruda && eruda.init();


  


