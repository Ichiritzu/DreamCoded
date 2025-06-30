import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <div className="dc-card-wrapper">
      <div className="skeleton-img">
        <Skeleton height="100%" width="100%" />
      </div>
      <div className="dc-card-body">
        <h3><Skeleton width="60%" height={20} /></h3>
        <div className="dc-meta">
          <Skeleton width={70} height={14} />
          <Skeleton width={40} height={14} />
          <Skeleton width={40} height={14} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
