const selButton = document.getElementById('selBtn')
const titleInput = document.getElementById('titleInput')


document.getElementById('procssBtn').addEventListener('click', () => {
  const dir =   document.getElementById('selDir').innerText
  window.electronAPI.process(dir)
})

selButton.addEventListener('click', async () => {
  const dirPath = await window.electronAPI.openDir()
  document.getElementById('selDir').innerText = dirPath
})

function showDir(){
  const dir =   document.getElementById('selDir').innerText + '/output';
  window.electronAPI.showDir(dir);
}