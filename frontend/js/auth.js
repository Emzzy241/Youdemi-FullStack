async function heyThere() {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/")
    console.log(res)
    alert("Hey there")
}

async function loginUser(email, password) {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/signin", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username: email, password })
    })

    const data = await res.json()   
}

async function registerUser(email, password) {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username: email, password})
    })
}

async function allCourses() {
    const res = await fetch("https://youdemi-fullstack.onrender.com/api/v1/course/courses", {
        method: "GET"
    })

    console.log(res)
    
}