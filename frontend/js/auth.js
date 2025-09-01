async function heyThere() {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/")
    console.log(res)
    alert("Hey there")
}