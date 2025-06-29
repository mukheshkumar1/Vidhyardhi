import React, { useEffect, useState } from 'react';
import './ImageSlider.css';
import { Button } from "@/components/ui/button"; // adjust import based on your file structure
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideItem {
  name: string;
  description: string;
  imageUrl: string;
}

const GallerySection: React.FC = () => {
  const [items, setItems] = useState<SlideItem[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Unexpected gallery response:", data);
        }
      })
      .catch(err => {
        console.error('Error fetching gallery:', err);
      });
  }, []);

  const nextSlide = () => {
    setItems((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const prevSlide = () => {
    setItems((prev) => {
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });
  };

  return (
    <section id="gallery" className="gallery-section">
      <h2 className="section-title">Gallery</h2>
      <div className="gallery-container">
        <div className="slide">
          {items.map((item, index) => (
            <div
              key={index}
              className="item"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            >
              <div className="content">
                <div className="name">{item.name}</div>
                <div className="description">{item.description}</div>
                <button>See More</button>
              </div>
            </div>
          ))}
        </div>

        <div className="button flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={prevSlide}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" onClick={nextSlide}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
