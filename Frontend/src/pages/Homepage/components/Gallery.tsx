import React, { useEffect, useState } from 'react';
import './ImageSlider.css';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface SlideItem {
  name: string;
  description: string;
  imageUrl: string;
}

const GallerySection: React.FC = () => {
  const [items, setItems] = useState<SlideItem[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

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

  useEffect(() => {
    fetch('https://vidhyardhi.onrender.com/api/admin/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error);
  }, []);


  return (
    <section id="gallery" className="gallery-section">
      <h2 className="section-title">Gallery</h2>

      {/* ✅ Desktop View */}
      <div className="gallery-container desktop-view">
        <div className="slide">
          {items.slice(0, 1).map((item, index) => (
            <div
              key={index}
              className="item active"
              onClick={() => setModalImage(item.imageUrl)}
            >
              <div
                className="image-wrapper"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="content">
                <div className="name">{item.name}</div>
                <div className="description">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="button">
          <Button variant="outline" onClick={prevSlide}>
            <ArrowLeft />
          </Button>
          <Button variant="outline" onClick={nextSlide}>
            <ArrowRight />
          </Button>
        </div>
      </div>

      {/* ✅ Mobile View */}
      <div className="mobile-slide">
        {items.map((item, index) => (
          <div
            className="mobile-item"
            key={index}
            onClick={() => setModalImage(item.imageUrl)}
          >
            <div
              className="mobile-image"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            ></div>
            <div className="mobile-content">
              <div className="name">{item.name}</div>
              <div className="description">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Fullscreen Modal */}
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <div className="image-modal-content">
            <img src={modalImage} alt="Full view" />
            <button className="close-btn" onClick={() => setModalImage(null)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
