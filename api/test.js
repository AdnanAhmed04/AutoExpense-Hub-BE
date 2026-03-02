const registerData = { name: "Test User", email: "test@example.com", password: "password123" };
let token = "";
let carId = "";

async function runTests() {
    console.log("Testing POST /api/auth/register...");
    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData)
        });
        const data = await res.json();
        console.log("Register Response:", data);
        if (!data.token) throw new Error("Missing token in registration response!");
        token = data.token;
    } catch (error) {
        console.error("Register Error:", error.message);
    }

    console.log("\nTesting GET /api/auth/me...");
    try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Get Me Response:", data);
    } catch (error) {
        console.error("Get Me Error:", error.message);
    }

    console.log("\nTesting POST /api/cars...");
    try {
        const res = await fetch("http://localhost:5000/api/cars", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ make: "Toyota", model: "Corolla", year: 2021 })
        });
        const data = await res.json();
        console.log("Create Car Response:", data);
        carId = data._id;
    } catch (error) {
        console.error("Create Car Error:", error.message);
    }

    console.log("\nTesting POST /api/cars/:id/expenses...");
    try {
        const res = await fetch(`http://localhost:5000/api/cars/${carId}/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: "Oil Change", price: 50, type: "Maintenance" })
        });
        const data = await res.json();
        console.log("Create Expense Response:", data);
    } catch (error) {
        console.error("Create Expense Error:", error.message);
    }

    console.log("\nTesting GET /api/cars...");
    try {
        const res = await fetch("http://localhost:5000/api/cars", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Get Cars (with totalExpenses) Response:", data);
    } catch (error) {
        console.error("Get Cars Error:", error.message);
    }
}

runTests();
