// HomePage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

// Hook for visibility
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    const currentRef = ref.current;
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [ref, options]);

  return [ref, isIntersecting];
};


const ProjectCard = React.memo(({ app, isVisibleSlide }) => {
  const [cardRef, isVisible] = useOnScreen({ threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);
  const [allowAnimation, setAllowAnimation] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      setAllowAnimation(true);
      timerRef.current = setTimeout(() => setAllowAnimation(false), 10000);
    } else {
      clearTimeout(timerRef.current);
      setAllowAnimation(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isVisible]);

  const getAvatarSrc = (app) => {
    return app.author_avatar_url
      ? `https://dreamcoded.com${app.author_avatar_url}`
      : `https://ui-avatars.com/api/?name=${app.author}&background=161b22&color=c9d1d9&size=24`;
  };

  const handleInnerLinkClick = (e) => e.stopPropagation();

  const iframeSrcDoc = useMemo(() => {
  if (!(isVisible && isVisibleSlide)) return null;

  const iframeStyles = `body { margin: 0; overflow: hidden; }`;
  const includeJS = isHovered || allowAnimation
    ? `<script>${app.code_js || ''}</script>`
    : '';

  return `<!DOCTYPE html><html><head><style>${iframeStyles}${app.code_css || ''}</style></head><body>${app.code_html || ''}${includeJS}</body></html>`;
}, [isVisible, isVisibleSlide, isHovered, allowAnimation, app]);

  return (
    <div
      ref={cardRef}
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
  to={isVisibleSlide ? `/project/${app.id}` : '#'}
  onClick={(e) => {
    if (!isVisibleSlide) e.preventDefault(); // Prevent navigation from offset cards
  }}
  className="card-image-link"
>

        <div className="card-image-container">
  {iframeSrcDoc ? (
    <iframe
      key={app.id} // forces reload when app changes
      srcDoc={iframeSrcDoc}
      title={app.title}
      sandbox="allow-scripts"
      className="card-iframe-preview"
      loading="lazy"
    />
  ) : (
    <div className="iframe-placeholder">
      <span className="placeholder-title">{app.title}</span>
    </div>
  )}
</div>


      </Link>
      <div className="card-content">
        <h3 className="card-title">
          <Link to={`/project/${app.id}`}>{app.title}</Link>
        </h3>
        {app.tags && (
          <div className="card-tags-container">
            {app.tags.split(',').slice(0, 3).map(tag => (
              <Link
                key={tag}
                to={`/tag/${tag.trim()}`}
                className="tag-pill"
                onClick={handleInnerLinkClick}
              >
                {tag.trim()}
              </Link>
            ))}
          </div>
        )}
        <div className="card-footer">
          <Link
            to={`/user/${app.author}`}
            className="card-author"
            onClick={handleInnerLinkClick}
          >
            <img src={getAvatarSrc(app)} alt={app.author} className="card-avatar" />
            <span>{app.author}</span>
          </Link>
          <div className="card-stats">
            <span>❤️ {app.total_likes}</span>
            <span>👁️ {app.total_views}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const CarouselRow = ({ title, filter, tag }) => {
    
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    let apiUrl = `https://dreamcoded.com/api.php?limit=12&filter=${filter}&t=${Date.now()}`;
    if (tag) {
      apiUrl = `https://dreamcoded.com/api.php?filter=tagged&tag=${tag}&t=${Date.now()}`;
    }
    fetch(apiUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => setApps(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, tag]);

  return (
    <section className="carousel-section-wrapper">
      <h2 className="carousel-section-title">{title}</h2>
      <Swiper
  modules={[Navigation, Pagination]}
  spaceBetween={30}
  centeredSlides={true}
  pagination={{ clickable: true }}
  navigation={true}
  onSwiper={setSwiperInstance}
  onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
  breakpoints={{
    640: { slidesPerView: 2.5, centeredSlides: true },
    1024: { slidesPerView: 3.5, centeredSlides: true }
  }}
  className="mySwiper"
>

        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <SwiperSlide key={idx}><SkeletonCard /></SwiperSlide>
          ))
        ) : (
          apps.map((app, index) => (
            <SwiperSlide
  key={app.id}
  onClick={() => swiperInstance?.slideTo(index)}
  style={{ cursor: 'pointer' }}
>
  <ProjectCard app={app} isVisibleSlide={index === currentIndex} />
</SwiperSlide>

          ))
        )}
      </Swiper>
    </section>
  );
};

const Star = () => {
  const [position] = useState({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 2
  });

  return (
    <div
      className="twinkle-star"
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        fontSize: `${position.size}rem`,
        animationDelay: `${position.delay}s`,
      }}
    >
      ✦
    </div>
  );
};

const HomePage = () => {
  const { tagName } = useParams();

  return (
    <div className="dc-page">
      {!tagName && (
        <section className="dc-hero">
          <div className="starfield-container">
            {Array.from({ length: 30 }).map((_, i) => <Star key={i} />)}
          </div>
          <div className="hero-content">
            <h1 className="dc-title">DreamCoded</h1>
            <p className="dc-sub">Where digital dreams become interactive reality.</p>
          </div>
        </section>
      )}

      <div className="page-content-wrapper">
        {tagName ? (
          <CarouselRow title={`Projects tagged with #${tagName}`} filter="tagged" tag={tagName} />
        ) : (
          <>
            <CarouselRow title="Trending Projects" filter="trending" />
            <CarouselRow title="Newest Submissions" filter="newest" />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
