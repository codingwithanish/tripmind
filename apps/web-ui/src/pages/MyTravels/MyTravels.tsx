import React, { useState, useEffect, useRef } from 'react';
import { TravelCard } from '@components/travel/TravelCard';
import myTravelService from '@services/myTravelService';
import { MyTravelCard, TravelCardStatus, PaginationInfo } from '@/types/myTravel.types';
import './MyTravels.css';

type FilterStatus = TravelCardStatus | 'all';

interface FilterTab {
    key: FilterStatus;
    label: string;
}

const filterTabs: FilterTab[] = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'planning', label: 'Planning' },
    { key: 'completed', label: 'Completed' },
    { key: 'dropped', label: 'Dropped' },
];

const MyTravels: React.FC = () => {
    const [travels, setTravels] = useState<MyTravelCard[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Guard against React StrictMode double-mount
    const hasFetchedRef = useRef(false);

    const fetchTravels = async (page: number = 1, status?: FilterStatus) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: 10,
                status: status && status !== 'all' ? status : undefined,
            };

            const response = await myTravelService.getMyTravels(params);
            setTravels(response.data);
            setPagination(response.pagination);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching travels:', err);
            setError('Failed to load your travels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Prevent duplicate fetch from React StrictMode double-mount
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        fetchTravels(1, activeFilter);
    }, []);

    const handleFilterChange = (status: FilterStatus) => {
        setActiveFilter(status);
        hasFetchedRef.current = true;
        fetchTravels(1, status);
    };

    const handlePageChange = (page: number) => {
        fetchTravels(page, activeFilter);
    };

    const handleRetry = () => {
        fetchTravels(currentPage, activeFilter);
    };

    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const pages: number[] = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(i);
        }

        return (
            <div className="my-travels-pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <div className="pagination-pages">
                    {pages.map((page) => (
                        <button
                            key={page}
                            className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="my-travels-container">
            <div className="my-travels-header">
                <h1 className="my-travels-title">My Travels</h1>
                <p className="my-travels-subtitle">Manage and track all your travel plans</p>
            </div>

            {/* Filter Tabs */}
            <div className="my-travels-filters">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                        onClick={() => handleFilterChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="my-travels-content">
                {/* Loading State */}
                {loading && (
                    <div className="my-travels-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your travels...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="my-travels-error">
                        <p>{error}</p>
                        <button className="retry-button" onClick={handleRetry}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && travels.length === 0 && (
                    <div className="my-travels-empty">
                        <p className="empty-title">No travels found</p>
                        <p className="empty-subtitle">
                            {activeFilter === 'all'
                                ? "You haven't created any travel plans yet."
                                : `You don't have any ${activeFilter} travel plans.`}
                        </p>
                    </div>
                )}

                {/* Travel Cards */}
                {!loading && !error && travels.length > 0 && (
                    <div className="my-travels-grid">
                        {travels.map((travel) => (
                            <TravelCard key={travel.thread_id} travel={travel} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && renderPagination()}
            </div>
        </div>
    );
};

export default MyTravels;
