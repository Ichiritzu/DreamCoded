import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

const CarouselRow = ({ title, filter }) => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSkeletons, setShowSkeletons] = useState(false);

    useEffect(() => {
        setLoading(true);
        setShowSkeletons(false);
        const skeletonTimeout = setTimeout(() => setShowSkeletons(true), 200);

        const apiUrl = `https://dreamcoded.com/api.php?limit=12&filter=${filter}&t=${Date.now()}`;

        fetch(apiUrl)
            .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
            .then((data) => {
                setApps(data.projects || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
            
        return () => clearTimeout(skeletonTimeout);
    }, [filter]);

    const getAvatarSrc = (app) => {
        if (app.author_avatar_url) {
            return `https://dreamcoded.com${app.author_avatar_url}?v=${Date.now()}`;
        } else {
            return `https://ui-avatars.com/api/?name=${app.author}&background=161b22&color=c9d1d9&size=24`;
        }
    };

    return (
        <section className="carousel-section-wrapper">
            <h2 className="carousel-section-title">{title}</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1.25}
                centeredSlides={true}
                pagination={{ clickable: true }}
                navigation={true}
                breakpoints={{
                    768: { slidesPerView: 3, spaceBetween: 20, centeredSlides: false },
                    1024: { slidesPerView: 3, spaceBetween: 30, centeredSlides: false },
                }}
                className="mySwiper"
            >
                {loading && showSkeletons && 
                    Array.from({ length: 5 }).map((_, idx) => (
                        <SwiperSlide key={idx}><SkeletonCard /></SwiperSlide>
                    ))
                }

                {!loading && apps.map((app) => (
                    <SwiperSlide key={app.id}>
                        <div className="carousel-card-wrapper">
                            <Link to={`/project/${app.id}`} className="carousel-card-link">
                                <img src={app.image_url} alt={app.title} loading="lazy" className="carousel-card-img" />
                                <div className="carousel-card-overlay">
                                    <h3>{app.title}</h3>
                                </div>
                            </Link>
                            <div className="carousel-card-meta">
                                <Link to={`/user/${app.author}`} className="carousel-author-link">
                                    <img 
                                        src={getAvatarSrc(app)} 
                                        alt={app.author} 
                                        className="carousel-author-avatar"
                                    />
                                    {app.author}
                                </Link>
                                <div className="carousel-stats">
                                    <span>❤️ {app.total_likes}</span>
                                    <span>👁️ {app.total_views}</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

const HomePage = () => {
    return (
        <div className="dc-page">
            <section className="dc-hero">
                <h1 className="dc-title">DreamCoded</h1>
                <p className="dc-sub">Where digital dreams become interactive reality.</p>
            </section>
            
            <div className="page-content-wrapper">
                <CarouselRow title="Trending Projects" filter="trending" />
                <CarouselRow title="Newest Submissions" filter="newest" />
            </div>
        </div>
    );
};

export default HomePage;
