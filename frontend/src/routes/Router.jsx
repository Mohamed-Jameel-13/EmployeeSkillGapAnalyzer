import React, { createContext, useContext, useState, useEffect } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const getInitialState = () => {
    const hash = window.location.hash.replace("#", "") || "/dashboard";
    const [path, queryString] = hash.split("?");
    const searchParams = new URLSearchParams(queryString || "");
    const params = Object.fromEntries(searchParams.entries());

    let route = "dashboard";
    if (path.startsWith("/students/new")) route = "add-student";
    else if (path.startsWith("/students/") && path.length > "/students/".length) {
      route = "student-profile";
      params.studentId = path.split("/students/")[1];
    } else if (path.startsWith("/students")) route = "students";
    else if (path.startsWith("/skills")) route = "skills";
    else if (path.startsWith("/jobs/") && path.length > "/jobs/".length) {
      route = "job-details";
      params.jobId = path.split("/jobs/")[1];
    } else if (path.startsWith("/jobs")) route = "jobs";
    else if (path.startsWith("/skill-gap")) route = "skill-gap";
    else if (path.startsWith("/recommendations")) route = "recommendations";
    else if (path.startsWith("/applications")) route = "applications";

    return { route, params };
  };

  const [state, setState] = useState(getInitialState);

  const navigate = (route, params = {}) => {
    setState({ route, params });

    let hashPath = `/${route}`;
    if (route === "add-student") hashPath = "/students/new";
    else if (route === "student-profile" && params.studentId) hashPath = `/students/${params.studentId}`;
    else if (route === "job-details" && params.jobId) hashPath = `/jobs/${params.jobId}`;

    const isPathParam = (k) => {
      if (k === "studentId" && (route === "student-profile" || route === "add-student")) return true;
      if (k === "jobId" && route === "job-details") return true;
      return false;
    };

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (!isPathParam(k) && v !== undefined && v !== null) {
        queryParams.set(k, v);
      }
    });

    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    window.location.hash = `${hashPath}${queryStr}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      setState(getInitialState());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute: state.route, params: state.params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export const useRouter = () => useContext(RouterContext);