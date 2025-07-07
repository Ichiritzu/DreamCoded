import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HomePage.css';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

// --- Simplified ProjectCard Component ---
const ProjectCard = ({ app }) => {
    const getAvatarSrc = (app) => {
        if (app.author_avatar_url) {
            return `https://dreamcoded.com${app.author_avatar_url}?v=${Date.now()}`;
        }
        return `https://ui-avatars.com/api/?name=${app.author}&background=161b22&color=c9d1d9&size=24`;
    };

    // Stop click from bubbling up to a parent link
    const handleInnerLinkClick = (e) => {
        e.stopPropagation();
    };
    
    // The iframe content is now always present
    const iframeSrcDoc = `<!DOCTYPE html><html><head><style>${app.code_css || ''}</style></head><body>${app.code_html || ''}<script>${app.code_js || ''}<\/script></body></html>`;

    return (
        <div className="card">
            <Link to={`/project/${app.id}`} className="card-image-link">
                <div className="card-image-container">
                    <iframe
                        srcDoc={iframeSrcDoc}
                        title={app.title}
                        sandbox="allow-scripts"
                        className="card-iframe-preview"
                    />
                    <div className="card-hover-overlay"></div>
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
                        <img 
                            src={getAvatarSrc(app)} 
                            alt={app.author} 
                            className="card-avatar"
                        />
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
};


const CarouselRow = ({ title, filter, tag }) => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let apiUrl = `https://dreamcoded.com/api.php?limit=12&filter=${filter}&t=${Date.now()}`;
        if (tag) {
            apiUrl = `https://dreamcoded.com/api.php?filter=tagged&tag=${tag}&t=${Date.now()}`;
        }
        
        fetch(apiUrl)
            .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
            .then((data) => {
                setApps(data.projects || []);
            })
            .catch(() => { /* Handle error if needed */ })
            .finally(() => setLoading(false));
    }, [filter, tag]);

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
                    640: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
                    1024: { slidesPerView: 3, spaceBetween: 30, centeredSlides: false },
                }}
                className="mySwiper"
            >
                {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                        <SwiperSlide key={idx}><SkeletonCard /></SwiperSlide>
                    ))
                ) : (
                    apps.map((app) => (
                        <SwiperSlide key={app.id}>
                           <ProjectCard app={app} />
                        </SwiperSlide>
                    ))
                )}
            </Swiper>
        </section>
    );
};


const HomePage = () => {
    const { tagName } = useParams();

    return (
        <div className="dc-page">
            {!tagName && (
                 <section className="dc-hero">
                     <h1 className="dc-title">DreamCoded</h1>
                     <p className="dc-sub">Where digital dreams become interactive reality.</p>
                 </section>
            )}
            
            <div className="page-content-wrapper">
                {tagName ? (
                    <CarouselRow 
                        title={`Projects tagged with #${tagName}`} 
                        filter="tagged" 
                        tag={tagName} 
                    />
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