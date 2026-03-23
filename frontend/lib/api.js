import axios from "axios";

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getBlogs = async () => {
    const res = await API.get("/blogs?populate=*", {
        cache: "no-store", // 🔥 important
    });
    return res.data.data;
};

export const getBlogBySlug = async (slug) => {
    const res = await API.get(`/blogs?filters[Slug][$eq]=${slug}&populate=*`);
    return res.data.data[0];
};

export const subscribeUser = async (form) => {
    return await API.post("/subscribe", {
        data: {
            fullname: form.fullname,
            email: form.email,
            phone: Number(form.phone), // important
            organization: form.organization,
            interest: form.interest,
            source: form.source
        }
    });
};



export const sendOTP = async (form) => {
    console.log(form.email)
    return API.post("/otp", form)

};



export const verifyOTP = async (form) => {
    return API.post("/verify-otp", {
        email: form.email,
        otp: form.otp,
        data: {
            fullname: form.fullname,
            email: form.email,
            phone: Number(form.phone),
            organization: form.organization,
            interests: form.interests,
            source: form.source,
        },
    });
};