async function heyThere() {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/v1/signin")
    console.log(res)
    alert("Hey there")
}