// // src/utils/fetchInterceptor.js
// export const fetchInterceptor = async (...args) => {
//   if (typeof window === "undefined") return fetch(...args); // server fallback

//   const response = await fetch(...args);

//   try {
//     const clone = response.clone();
//     const data = await clone.json();

//     if (
//       response.status === 401
//     ) {
//       // ✅ Ensure localStorage is available
//       if (typeof window !== "undefined") {
//         // clear only the token, keep other stuff if needed
//         localStorage.clear();
//         localStorage.setItem("sessionExpired", "true");
//         setTimeout(() => {
//         window.location.href = "/login"; // redirect after setting flag
//       }, 2000);
//       }

      

//       return response; // still return response if needed
//     }

//     return response;
//   } catch {
//     return response;
//   }
// };
