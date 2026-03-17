let channelsData=[]
let player
let currentChannel=0



function onYouTubeIframeAPIReady(){

init()

}



async function init(){

for(let ch of CHANNELS){

let vids=await loadPlaylist(ch.playlist)

channelsData.push({

name:ch.name,
videos:vids,
epg:generateEPG(vids)

})

}

renderChannels()

startChannel(0)

}



async function loadPlaylist(id){

let url=`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id}&key=${API_KEY}`

let res=await fetch(url)

let data=await res.json()

let videos=[]

for(let item of data.items){

let vid=item.snippet.resourceId.videoId
let title=item.snippet.title

let dur=await getDuration(vid)

videos.push({

id:vid,
title:title,
duration:dur

})

}

return videos

}



async function getDuration(id){

let url=`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${API_KEY}`

let res=await fetch(url)

let data=await res.json()

let iso=data.items[0].contentDetails.duration

return isoToSeconds(iso)

}



function isoToSeconds(iso){

let h=iso.match(/(\d+)H/)
let m=iso.match(/(\d+)M/)
let s=iso.match(/(\d+)S/)

h=h?parseInt(h[1]):0
m=m?parseInt(m[1]):0
s=s?parseInt(s[1]):0

return h*3600+m*60+s

}



function renderChannels(){

let div=document.getElementById("channels")

channelsData.forEach((c,i)=>{

let el=document.createElement("div")

el.className="channel"

el.innerText=c.name

el.onclick=()=>startChannel(i)

div.appendChild(el)

})

}



function startChannel(i){

currentChannel=i

updateEPG()

playCurrent()

}



function nowSeconds(){

let d=new Date()

return d.getHours()*3600+d.getMinutes()*60+d.getSeconds()

}



function getProgram(){

let now=nowSeconds()

let epg=channelsData[currentChannel].epg

for(let p of epg){

if(now>=p.start && now<p.start+p.duration){

return{

video:p.video,
offset:now-p.start

}

}

}

return epg[0]

}



function playCurrent(){

let p=getProgram()

if(!player){

player=new YT.Player("player",{

videoId:p.video,

playerVars:{
autoplay:1,
mute:1,
controls:1
},

events:{

onReady:(e)=>{

e.target.seekTo(p.offset)

e.target.playVideo()

}

}

})

}else{

player.loadVideoById(p.video,p.offset)

}

}



function updateEPG(){

let div=document.getElementById("epg")

div.innerHTML=""

let epg=channelsData[currentChannel].epg.slice(0,25)

for(let p of epg){

let el=document.createElement("div")

el.className="program"

el.innerText=formatTime(p.start)+"  "+p.title

div.appendChild(el)

}

}