import axios from "axios";

async function test() {
  try {
    console.log("Attempting login...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@example.com",
      password: "admin123",
    });
    const token = loginRes.data.token;
    console.log("Login successful, token found.");

    console.log("Attempting to fetch reports...");
    const reportRes = await axios.get("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Reports fetched successfully:", reportRes.data.summary);
  } catch (error) {
    console.error(
      "Test failed:",
      error.response ? error.response.status : error.message
    );
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

test();
