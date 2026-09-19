"use client";

import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/landing/Navbar";
import UseCases from "@/components/landing/UseCases";

export default function Home() {
  return (
    <div style={{background: "#0A0A0F", color: "#F1F0F5", minHeight: "100vh", overflowX: "hidden" , paddingTop:"60px"}}>
      <Navbar/>
      <Hero/>
      <UseCases/>
      <Features/>
      <HowItWorks/>
      <Footer/>
    </div>
  );
}