let likeArr =[
    {"userId":"5e16844db53aea14805c1558"},
    {"userId":"33333"},
]
let userId = "5e16844db53aea14805c1558"
// for(let i=0;i<likeArr.length;i++){
//     let {userId:userid} = likeArr[i]
//     if(userid==="11111"){
//         likeArr.splice(i,1)
//     }
// }
// console.log(likeArr)
let flag= likeArr.some((item,i) => {
    return item.userId === userId
})
console.log(flag)
if(!flag){
    likeArr.push({"userId":"44444"})
}
console.log(likeArr)