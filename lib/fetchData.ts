export async function getCourses(id: string | undefined) {
  try {
    const res = await fetch(`http://localhost:3000/api/course`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        s_id: id,
      }),
    });

    console.log("res: ", res);

    if (!res.ok) {
      throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in getCourses:", error);
    return { error: "Failed to fetch courses" }; // Return an appropriate fallback or error object
  }
}

export async function getTeacherCourses(id: string | undefined) {
  try {
    const res = await fetch(`http://localhost:3000/api/t_course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        t_id: id,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch teacher courses: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in getTeacherCourses:", error);
    return { error: "Failed to fetch teacher courses" }; // Return an appropriate fallback or error object
  }
}
