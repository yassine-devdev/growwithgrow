
import React, { useState } from 'react';
import AdministrationL2Sidebar from './components/AdministrationL2Sidebar';
import Placeholder from '../../../components/Placeholder';


const AdministrationView: React.FC = () => {
    const [activeL2Item, setActiveL2Item] = useState('procurement-hub');

    const navItems = [
        { id: 'procurement-hub', label: 'Central Procurement Hub' },
        { id: 'booking-management', label: 'Accommodation & Car Rental' },
        { id: 'maintenance-management', label: 'Maintenance Management' },
        { id: 'concierge-coordination', label: 'Concierge Coordination' },
        { id: 'strategic-analytics', label: 'Strategic Analytics' },
        { id: 'media-islamic-resources', label: 'Media & Islamic Resources' },
        { id: 'financial-approvals', label: 'Real-Time Approvals' },
        { id: 'vendor-notifications', label: 'Vendor Notifications' },
        { id: 'dept-tracking', label: 'Departmental Tracking' },
        { id: 'transport-monitoring', label: 'Live Transport Monitoring' },
        { id: 'facility-efficiency', label: 'Facility Efficiency' },
        { id: 'smart-scheduling', label: 'Smart Scheduling' },
        { id: 'resource-booking', label: 'Resource Booking' },
        { id: 'incident-management', label: 'Incident Report Management' },
        { id: 'digital-twin', label: 'Digital Twin Campus' },
        { id: 'traffic-optimization', label: 'AI Traffic Optimization' },
        { id: 'event-calendar', label: 'Master Event Calendar' },
        { id: 'safety-analytics', label: 'Safety Compliance' },
        { id: 'space-analytics', label: 'Space Utilization' },
        { id: 'smart-inventory', label: 'Smart Inventory' },
        { id: 'energy-management', label: 'Energy Management' }
    ];
    
    return (
        <div className="flex h-full">
            <AdministrationL2Sidebar activeItem={activeL2Item} setActiveItem={setActiveL2Item} navItems={navItems} />
            <main className="flex-1 p-1 sm:p-2 lg:p-3 overflow-y-auto" style={{ height: '100%' }}>
                 <Placeholder sectionName={navItems.find(item => item.id === activeL2Item)?.label || 'Administration Dashboard'} />
            </main>
        </div>
    );
};

export default AdministrationView;
