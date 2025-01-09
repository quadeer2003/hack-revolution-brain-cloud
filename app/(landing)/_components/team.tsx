import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function Team() {
  const testimonials = [
    {
      quote:
        "Mohammed Shoaib Asim has a keen eye for detail and innovation. His work on Canva-like UI components has set a new standard for design and usability, seamlessly blending functionality with aesthetic appeal.",
      name: "Mohammed Shoaib Asim",
      designation: "Working on Canva component",
      src: "/sho.jpeg",
    },
    {
      quote:
        "Anaba Abbass's expertise in backend development and authentication systems ensured a smooth and secure user experience. Her ability to design scalable solutions has been instrumental in our success.",
      name: "Anaba Abbass",
      designation: "Backend and Authentication",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Mohd Abdul Quadeer has revolutionized our processes with his exceptional work on Chrome extensions and backend systems. His solutions are intuitive and efficient, significantly enhancing our team's productivity.",
      name: "Mohd Abdul Quadeer",
      designation: "Chrome Extension and Backend",
      src: "/quadeer.png",
    },
    {
      quote:
        "Juveriya Begum has elevated user experiences with her front-end expertise. Her ability to create user-friendly and visually appealing interfaces has delighted both our team and end users.",
      name: "Juveriya Begum",
      designation: "Front End",
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Ruqhaya Nooreen’s focus on performance optimization has resulted in fast, scalable, and reliable applications. Her contributions have been critical in delivering a seamless experience.",
      name: "Ruqhaya Nooreen",
      designation: "Front End",
      src: "https://images.unsplash.com/photo-1551292831-023188e78222?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGZyZWUlMjBnaXJsfGVufDB8fDB8fHww",
    },
    {
      quote:
        "Tashfeen Fatima's expertise in backend development and authentication has been a cornerstone of our system's security. Her work ensures a robust and reliable foundation for our platform.",
      name: "Tashfeen Fatima",
      designation: "Backend and Authentication",
      src: "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },    
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}