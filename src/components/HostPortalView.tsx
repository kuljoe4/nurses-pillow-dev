import React, { useState, useEffect, useRef } from 'react';
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { BookingRequest, HousingListing } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';
import { HostAddressMapping } from './HostAddressMapping';
import { ListingDetailModal } from './ListingDetailModal';
import { HostAvailabilityCalendar } from './HostAvailabilityCalendar';
import { AvailabilityInsight } from './AvailabilityInsight';

interface HostPortalViewProps {
  isNightShiftMode: boolean;
  bookingRequests: BookingRequest[];
  onApproveBooking: (id: string) => Promise<void> | void;
  onDeclineBooking: (id: string) => Promise<void> | void;
  onGoToHousing: () => void;
  initialTab?: 'dashboard' | 'editor' | 'onboarding';
  isNurseVerified?: boolean;
  verificationStatus?: string;
  onGoToClinicianDashboard?: () => void;
  onStartClinicianVerification?: () => void;
  currentUser?: {
    isHostVerified?: boolean;
    isIdVerified?: boolean;
    stripeAccountId?: string;
    payoutsEnabled?: boolean;
    id?: string;
    role: string;
    name: string;
    email?: string;
  };
}

export const HostPortalView: React.FC<HostPortalViewProps> = ({
  isNightShiftMode,
  bookingRequests,
  onApproveBooking,
  onDeclineBooking,
  onGoToHousing,
  initialTab = 'dashboard',
  isNurseVerified,
  verificationStatus,
  onGoToClinicianDashboard,
  onStartClinicianVerification,
  currentUser,
}) => {
  const [activeHostTab, setActiveHostTab] = useState<'dashboard' | 'editor' | 'calendar' | 'onboarding' | 'profile'>(initialTab as any);
  const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1);

  const [hostFullName, setHostFullName] = useState(currentUser?.name || 'Sarah M.');
  const [hostTitleBio, setHostTitleBio] = useState('RN Host • Superhost • Former UCSF Neuro ICU RN');
  const [hostAvatarUrl, setHostAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [profileSaveNotice, setProfileSaveNotice] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');

  const filteredRequests = React.useMemo(() => bookingRequests.filter(req => {
    if (filterStatus === 'pending') return req.status === 'pending_host_approval';
    if (filterStatus === 'confirmed') return req.status === 'approved' || req.status === 'active' || req.status === 'completed';
    if (filterStatus === 'declined') return req.status === 'declined';
    return true;
  }), [bookingRequests, filterStatus]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
      const res = await fetch('/api/host/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          fullName: hostFullName,
          hostTitle: hostTitleBio,
          avatarUrl: hostAvatarUrl,
        })
      });
      if (res.ok) {
        setProfileSaveNotice('Host profile updated successfully and synchronized!');
        setTimeout(() => setProfileSaveNotice(null), 3500);
      } else {
        setProfileSaveNotice('Failed to update profile.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setProfileSaveNotice('Error updating profile.');
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveHostTab(initialTab);
    }
  }, [initialTab]);

  // Note: For prototype purposes we use a fixed listing ID, or would extract it from context.

  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [hostListings, setHostListings] = useState<any[]>([]);

  // Fetch host's listing on load to get the ID
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (activeHostTab === 'editor' || activeHostTab === 'calendar') {
      const fetchListing = async () => {
        try {
          const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
          if (!token) return;

          const res = await fetch('/api/host-listings', {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
          });

          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = (res.headers.get('content-type')?.includes('application/json') ? await res.json() : {});
            if (isMounted && data.listings) {
              setHostListings(data.listings);
              // We'll let the user choose or hit 'Create New Listing'
            }

          } else if (!res.ok) {
             console.error(`Failed to fetch host listings: ${res.status} ${res.statusText}`);
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error("Failed to fetch host listing:", err);
          }
        }
      };
      fetchListing();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeHostTab]);


  // Fetch photos on load
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (activeHostTab === 'editor' && editingListingId) {
      const fetchPhotos = async () => {
        try {
          const res = await fetch(`/api/listings/${editingListingId}/photos`, {
            signal: controller.signal
          });
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            const data = (res.headers.get('content-type')?.includes('application/json') ? await res.json() : {});
            if (isMounted && data.photos) {
              setListingPhotos(data.photos.map((p: any) => ({
                id: p.id,
                url: p.url
              })));
            }
          } else if (!res.ok) {
            console.error(`Failed to load listing photos: ${res.status} ${res.statusText}`);
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error("Failed to load listing photos:", err);
          }
        }
      };
      fetchPhotos();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeHostTab, editingListingId]);

  // Screen B2 Editor Form State
  const [listingTitle, setListingTitle] = useState<string>('Sanctuary Stay');
  const [addressData, setAddressData] = useState<any>(null);
  const [propertyType, setPropertyType] = useState<'entire_property' | 'individual_rooms'>('individual_rooms');
  const [roomCount, setRoomCount] = useState<number>(2);
  const [roomPrices, setRoomPrices] = useState<number[]>([1950, 1850, 1750, 1650, 1550]);
  const [petFee, setPetFee] = useState<number>(0);
  const [parkingFee, setParkingFee] = useState<number>(0);
  const [extraOptionsStr, setExtraOptionsStr] = useState<string>('[]');

  const [listingPhotos, setListingPhotos] = useState<{ id?: string, url: string, file?: File }[]>([]);
  const [listingDocuments, setListingDocuments] = useState<{ id?: string, name: string, url: string, file?: File }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Saving listing...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);


  const removePhoto = (indexToRemove: number) => {
    setListingPhotos((prev) => {
      const newPhotos = [];
      for (let i = 0; i < prev.length; i++) {
        if (i !== indexToRemove) newPhotos.push(prev[i]);
      }
      return newPhotos;
    });
  };

  const removeDocument = (indexToRemove: number) => {
    setListingDocuments((prev) => {
      const newDocs = [];
      for (let i = 0; i < prev.length; i++) {
        if (i !== indexToRemove) newDocs.push(prev[i]);
      }
      return newDocs;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);

    if (listingPhotos.length + files.length > 25) {
      setUploadError('Maximum photo limit is 25 per listing.');
      return;
    }

    const validPhotos: { url: string; file: File }[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`Photo "${file.name}" exceeds the 5MB size limit (Max 5MB per photo, auto-compressed to WebP/JPEG).`);
        return;
      }
      validPhotos.push({
        url: URL.createObjectURL(file),
        file,
      });
    }

    setListingPhotos((prev) => [...prev, ...validPhotos]);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);

    if (listingDocuments.length + files.length > 5) {
      setUploadError('Maximum document limit is 5 PDF attachments per listing.');
      return;
    }

    const validDocs: { name: string; url: string; file: File }[] = [];
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        setUploadError(`Document "${file.name}" must be a PDF file.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`Document "${file.name}" exceeds the 10MB limit.`);
        return;
      }
      validDocs.push({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      });
    }

    setListingDocuments((prev) => [...prev, ...validDocs]);
  };

  const handleRemovePhoto = (index: number) => {
    setListingPhotos((prev) => {
      const updated = [...prev];
      if (updated[index].url.startsWith("blob:")) {
        URL.revokeObjectURL(updated[index].url);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const [cancellationTier, setCancellationTier] = useState<'Flexible' | 'Moderate' | 'Strict'>('Flexible');
  const [hasBlackout, setHasBlackout] = useState(true);
  const [hasQuietHours, setHasQuietHours] = useState(true);
  const [hasScrubWasher, setHasScrubWasher] = useState(true);
  const [hasDedicatedParking, setHasDedicatedParking] = useState(true);
  const [hasFiberWifi, setHasFiberWifi] = useState(true);
  const [isSavedEditor, setIsSavedEditor] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const previewListingObject: HousingListing = {
    id: editingListingId || 'preview-id',
    title: listingTitle || 'Sanctuary Stay',
    neighborhood: addressData?.formattedAddress || 'Durham, NC',
    city: addressData?.city || 'Durham',
    state: addressData?.state || 'NC',
    proximityToHospital: 'Under 1 Mile',
    nearestHospital: 'Duke University Hospital',
    driveTimeMinutes: 5,
    monthlyRate: roomPrices[0] || 1950,
    weeklyRate: Math.round((roomPrices[0] || 1950) / 4),
    beds: roomCount || 1,
    baths: 1,
    sqft: 850,
    images: listingPhotos.map(p => p.url),
    nurseRating: 5.0,
    reviewsCount: 1,
    amenities: {
      blackoutCurtains: hasBlackout,
      whiteNoiseMachine: true,
      daySleeperQuietHours: hasQuietHours,
      washerDryerInUnit: hasScrubWasher,
      dedicatedParking: hasDedicatedParking,
      highSpeedWifi: hasFiberWifi,
      fullyFurnished: true,
      petFriendly: petFee > 0,
      privateEntrance: propertyType === 'entire_property',
    },
    contractFlexProtection: cancellationTier === 'Flexible',
    featuredSanctuary: true,
    propertyType: propertyType,
    petFee: petFee,
    parkingFee: parkingFee,
    extraOptions: [],
  };

  // Stripe Connect State
  // Mock state for Stripe connect button interactions if needed
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(currentUser?.payoutsEnabled || false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [showEmbeddedOnboarding, setShowEmbeddedOnboarding] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // Processing States for bookings
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  // Host ID from authenticated user or fallback for demo
  const hostId = currentUser?.id || 'host-sarah-m';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('stripe_return') === 'true') {
      setActiveHostTab('onboarding');
      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
      fetch('/api/stripe/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ hostId }),
      })
        .then(() => {
          setPayoutsEnabled(true);
          fetchPayoutStatus();
        })
        .catch((e) => console.warn('Could not complete stripe onboarding in DB:', e));

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('stripe_refresh') === 'true') {
      setActiveHostTab('onboarding');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchPayoutStatus();
    } else {
      fetchPayoutStatus();
    }
  }, [hostId]);

  const fetchPayoutStatus = async () => {
    try {
      const res = await fetch(`/api/stripe/status/${hostId}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = (res.headers.get('content-type')?.includes('application/json') ? await res.json() : {});
        setPayoutsEnabled(data.payouts_enabled);
      } else if (!res.ok) {
        console.error(`Failed to fetch payout status: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe status', err);
    }
  };

  useEffect(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NursesPillow_SandboxKey94821';
    if (!publishableKey) return;

    try {
      const instance = loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret: async () => {
          const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
          const res = await fetch('/api/stripe/account-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ hostId }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Unable to establish payout session');
          }
          return data.client_secret;
        },
        appearance: {
          variables: {
            colorPrimary: '#0B2559',
            colorBackground: '#FFFFFF',
            colorText: '#1E293B',
            borderRadius: '8px',
          },
        },
      });
      setStripeConnectInstance(instance);
    } catch (err) {
      console.error('Failed to initialize ConnectJS:', err);
    }
  }, [hostId]);

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    setStripeError(null);
    setIsStripeLoading(true);
    try {
      setShowEmbeddedOnboarding(true);
      setTimeout(() => {
        setIsStripeLoading(false);
      }, 700);
    } catch (err: any) {
      console.error('Stripe onboarding error:', err);
      setStripeError(err.message || 'Unable to connect Stripe account.');
      setIsStripeLoading(false);
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadMessage('Saving listing...');

    try {
      // Create listing update payload
      const listingPayload = {
        listingId: editingListingId === 'new' ? undefined : editingListingId, // Pass ID to update instead of insert
        propertyType,
        roomCount,
        roomPrices,
        listingTitle,
        addressData,
        petFee,
        parkingFee,
        extraOptions: (() => { try { return JSON.parse(extraOptionsStr); } catch { return []; } })(),
        cancellationTier,
        amenities: {
          hasBlackout,
          hasQuietHours,
          hasScrubWasher,
          hasDedicatedParking,
          hasFiberWifi
        }
      };

      console.log('Saving listing...', listingPayload);

      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');

      // Save listing payload
      let currentListingId = editingListingId;
      const listingRes = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingPayload)
      });

      if (listingRes.ok && listingRes.headers.get('content-type')?.includes('application/json')) {
        const listingData = (listingRes.headers.get('content-type')?.includes('application/json') ? await listingRes.json() : {});
        currentListingId = listingData.listingId;
        if (!editingListingId) {
          setEditingListingId(currentListingId);
        }
      } else if (!listingRes.ok) {
        console.error(`Failed to save host listing: ${listingRes.status} ${listingRes.statusText}`);
      }

      // Handle photos - process the new files
      const newPhotosToUpload = [];
      for (let i = 0; i < listingPhotos.length; i++) {
        if (listingPhotos[i].file) newPhotosToUpload.push(listingPhotos[i]);
      }

      const newDocsToUpload = [];
      for (let i = 0; i < listingDocuments.length; i++) {
        if (listingDocuments[i].file) newDocsToUpload.push(listingDocuments[i]);
      }

      if (newPhotosToUpload.length > 0) {
        setUploadMessage(newPhotosToUpload.length > 1 ? 'Uploading photos...' : 'Uploading photo...');
        // In a real app, this would be a multipart/form-data POST request
        // or getting presigned S3 urls. Here we simulate it.
        const photosPayload = await Promise.all(
          newPhotosToUpload.map(async (photo, index) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  name: photo.file?.name,
                  type: photo.file?.type,
                  size: photo.file?.size,
                  data: reader.result,
                  displayOrder: index
                });
              };
              if (photo.file) reader.readAsDataURL(photo.file);
            });
          })
        );


        console.log('Uploading photos...', photosPayload);
        const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
        await fetch(`/api/listings/${currentListingId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ photos: photosPayload })
        });

      }

      if (newDocsToUpload.length > 0) {
        setUploadMessage(newDocsToUpload.length > 1 ? 'Uploading documents...' : 'Uploading document...');
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setIsSavedEditor(true);
      setTimeout(() => {
        setActiveHostTab('dashboard');
      }, 1000);
    } catch (err) {
      console.error("Error saving listing:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // ⚡ Bolt Performance Optimization: Single-pass booking aggregation
  // Replaced 3 independent O(N) array traversals (.filter x2, .filter+.reduce)
  // with a single O(N) memoized loop to prevent excessive recalculations on render.
  const { pendingBookings, confirmedBookings, totalMonthlyNet, payoutBookings } = React.useMemo(() => {
    const pending: BookingRequest[] = [];
    const confirmed: BookingRequest[] = [];
    const payout: BookingRequest[] = [];
    let net = 0;

    for (let i = 0; i < bookingRequests.length; i++) {
      const b = bookingRequests[i];
      if (b.status === 'pending_host_approval') {
        pending.push(b);
      }
      if (b.status === 'approved' || b.status === 'active' || b.status === 'completed') {
        confirmed.push(b);
      }
      if (b.status !== 'declined') {
        payout.push(b);
        net += (b.hostNetPayout || 0);
      }
    }
    return { pendingBookings: pending, confirmedBookings: confirmed, totalMonthlyNet: net, payoutBookings: payout };
  }, [bookingRequests]);

  return (
    <div
      className={`w-full min-h-[80vh] py-5 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#0B2559]'
      }`}
    >
      {/* Host Portal Top Bar - Streamlined Header & Capsule Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A6FA8] dark:text-[#3E9AD1]">
              Host Dashboard
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-[10px] font-bold">
              ~95% Net Payout Partner
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2559] dark:text-white">
            Welcome back
          </h1>
        </div>

        {/* Capsule Segment Switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shrink-0">
          <button
            type="button"
            onClick={() => setActiveHostTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeHostTab === 'dashboard'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span>Requests</span>
            {pendingBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#A8452E] text-white text-[10px] font-bold tabular-nums">
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('editor')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'editor'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            Listing &amp; Rooms
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('calendar')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'calendar'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:white'
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('onboarding')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'onboarding'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveHostTab('profile')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeHostTab === 'profile'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            Host Profile
          </button>
        </div>
      </div>

      {activeHostTab === 'calendar' && (
          <div className="max-w-xl mx-auto">
              {editingListingId ? (
                <HostAvailabilityCalendar listingId={editingListingId} />
              ) : hostListings.length > 0 ? (
                <HostAvailabilityCalendar listingId={hostListings[0].id} />
              ) : (
                <div className="text-center p-8 text-gray-500">No listings found.</div>
              )}
          </div>
      )}

      {/* Host Profile Tab */}
      {activeHostTab === 'profile' && (
        <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-lg space-y-6 max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-[#0B2559] dark:text-white">Host Public Profile &amp; Credentials</h2>
            <p className="text-xs text-gray-500 mt-1">Customize how your host name, bio, and badge appear on your listings and public profile page.</p>
          </div>

          {profileSaveNotice && (
            <div className="p-3 rounded-xl bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{profileSaveNotice}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">Host Full Name</label>
              <input
                type="text"
                value={hostFullName}
                onChange={(e) => setHostFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-medium outline-none focus:border-[#0A6FA8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">Host Title &amp; Bio</label>
              <input
                type="text"
                value={hostTitleBio}
                onChange={(e) => setHostTitleBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-medium outline-none focus:border-[#0A6FA8]"
                placeholder="E.g., Superhost • Former UCSF Neuro ICU RN"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={hostAvatarUrl}
                onChange={(e) => setHostAvatarUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-medium outline-none focus:border-[#0A6FA8]"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#0A6FA8] text-white text-xs font-bold shadow-md hover:bg-[#0C7EBF] transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeHostTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Quick Metrics 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Pending Review</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#A8452E] dark:text-[#F4E2DC] tabular-nums">
                  {pendingBookings.length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">24-hr response window</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Active Stays</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#0B2559] dark:text-white tabular-nums">
                  {confirmedBookings.length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Confirmed rotations</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Est. Net Payout</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums">
                  ${Math.round(totalMonthlyNet).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">~95% split / mo</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
              <span className="text-[11px] font-medium text-gray-500 block">Direct Payouts</span>
              <div>
                <span className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${payoutsEnabled ? 'text-[#2F6E5E] dark:text-[#aff0db]' : 'text-gray-400'}`}>
                  <span className="material-symbols-outlined text-[16px]">{payoutsEnabled ? 'check_circle' : 'pending'}</span>
                  <span>{payoutsEnabled ? 'Direct Active' : 'Not Connected'}</span>
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Automated direct deposit</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Booking Requests</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-xs font-bold text-[#0B2559] dark:text-white outline-none"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending Only</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="declined">Declined Only</option>
              </select>
          </div>

          {/* Booking List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-white dark:bg-[#0B1626] rounded-2xl border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                No booking requests found.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <h3 className="font-bold text-[#0B2559] dark:text-white">Request: {req.id}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status: {req.status}</p>
                </div>
              ))
            )}
          </div>

          {/* Payout History Section */}
          <div className="space-y-3.5 mt-8">
            <h2 className="text-base font-bold text-[#0B2559] dark:text-white">Payout History</h2>
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl border border-[rgba(11,37,89,0.06)] dark:border-[#233550] overflow-hidden shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              <table className="w-full text-xs">
                <thead className="bg-[#EFF6FB] dark:bg-[#0E1A2E] text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Date</th>
                    <th className="px-4 py-3 text-left font-bold">Booking ID</th>
                    <th className="px-4 py-3 text-right font-bold">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(11,37,89,0.06)] dark:divide-[#233550]">
                  {payoutBookings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">No payout history available.</td>
                    </tr>
                  ) : (
                    payoutBookings.map(b => (
                      <tr key={b.id} className="hover:bg-[#EFF6FB] dark:hover:bg-[#182840] transition-colors">
                        <td className="px-4 py-3">{b.startDate}</td>
                        <td className="px-4 py-3 tabular-nums">{b.id}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">${b.hostNetPayout.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Listings List Selector */}
      {activeHostTab === 'editor' && !editingListingId && hostListings.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Your Listings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {hostListings.map(l => (
              <div key={l.id} onClick={() => setEditingListingId(l.id)} className="p-4 bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] rounded-2xl cursor-pointer hover:border-[#0A6FA8] transition-all">
                <h3 className="font-bold text-[#0B2559] dark:text-white">{l.title || l.address_line1 || 'Sanctuary Stay'}</h3>
                <p className="text-xs text-gray-500">{l.city}, {l.state}</p>
              </div>
            ))}
            <div onClick={() => setEditingListingId('new')} className="p-4 bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-dashed border-[#0A6FA8] rounded-2xl cursor-pointer flex items-center justify-center flex-col gap-2 hover:bg-[#eaedff] dark:hover:bg-[#182840] transition-all">
              <span className="material-symbols-outlined text-[#0A6FA8]">add_circle</span>
              <span className="text-sm font-bold text-[#0A6FA8]">Create New Listing</span>
            </div>
          </div>
        </div>
      )}

      {activeHostTab === 'editor' && hostListings.length === 0 && !editingListingId && (
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Your Listings</h2>
           <div className="grid gap-4 md:grid-cols-2">
             <div onClick={() => setEditingListingId('new')} className="p-4 bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-dashed border-[#0A6FA8] rounded-2xl cursor-pointer flex items-center justify-center flex-col gap-2 hover:bg-[#eaedff] dark:hover:bg-[#182840] transition-all">
              <span className="material-symbols-outlined text-[#0A6FA8]">add_circle</span>
              <span className="text-sm font-bold text-[#0A6FA8]">Create New Listing</span>
            </div>
          </div>
        </div>
      )}

      {/* Listing & Room Calendar Editor - Responsive Card Grid Layout */}
      {activeHostTab === 'editor' && editingListingId && (
        <form onSubmit={(e) => { e.preventDefault(); if (editorStep === 3) handleSaveListing(e); else setEditorStep(prev => (prev + 1) as 1 | 2 | 3); }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={() => setEditingListingId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline mb-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Listings</span>
              </button>
              <span className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] uppercase tracking-wider">
                Listing &amp; Multi-Room Setup
              </span>
              <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Listing Configuration &amp; Healthcare Amenities</h2>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  onClick={() => setEditorStep(step as 1 | 2 | 3)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${
                    editorStep === step
                      ? 'bg-[#0A6FA8] text-white'
                      : editorStep > step
                      ? 'bg-[#2F6E5E] text-white'
                      : 'bg-[#EFF6FB] text-gray-400 dark:bg-[#15233a] dark:text-gray-500'
                  }`}
                >
                  {editorStep > step ? <span className="material-symbols-outlined text-[16px]">check</span> : step}
                </div>
                {step < 3 && (
                  <div className={`h-1 flex-1 rounded-full ${editorStep > step ? 'bg-[#2F6E5E]' : 'bg-[#EFF6FB] dark:bg-[#15233a]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {isSavedEditor && (
            <div className="p-3 rounded-xl bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db] text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Listing changes saved and synchronized with the search index!</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1: Property Basics */}
            {editorStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Card 1: Property Layout */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Step 1: Property Layout
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPropertyType('entire_property')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        propertyType === 'entire_property'
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a]'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-[20px] ${propertyType === 'entire_property' ? 'text-[#0A6FA8]' : 'text-gray-400'}`}>
                          real_estate_agent
                        </span>
                        <span className={`text-sm font-bold ${propertyType === 'entire_property' ? 'text-[#0A6FA8] dark:text-[#3E9AD1]' : 'text-gray-600 dark:text-gray-300'}`}>
                          Entire Property
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">Rent the entire unshared unit to a single traveling clinician.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPropertyType('individual_rooms')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        propertyType === 'individual_rooms'
                          ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a]'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-[20px] ${propertyType === 'individual_rooms' ? 'text-[#0A6FA8]' : 'text-gray-400'}`}>
                          meeting_room
                        </span>
                        <span className={`text-sm font-bold ${propertyType === 'individual_rooms' ? 'text-[#0A6FA8] dark:text-[#3E9AD1]' : 'text-gray-600 dark:text-gray-300'}`}>
                          Individual Rooms
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">Rent multiple bedrooms to different clinicians (shared common areas).</p>
                    </button>
                  </div>

                  {propertyType === 'individual_rooms' && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-2">
                        Number of Leasable Rooms
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRoomCount(Math.max(2, roomCount - 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#0B2559] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                          aria-label="Decrease room count"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <span className="text-lg font-bold w-4 text-center text-[#0A6FA8] dark:text-[#3E9AD1]">{roomCount}</span>
                        <button
                          type="button"
                          onClick={() => setRoomCount(Math.min(5, roomCount + 1))}
                          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#0B2559] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                          aria-label="Increase room count"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-2">
                        Listing Title
                      </label>
                      <input
                        type="text"
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="E.g., Cozy Retreat near Duke Hospital"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm outline-none focus:border-[#0A6FA8] transition-colors"
                      />
                    </div>
                    <div className="mt-4">
                      <HostAddressMapping
                        isNightShiftMode={isNightShiftMode}
                        onAddressConfirmed={(data) => setAddressData(data)}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setEditorStep(2)}
                    className="px-6 py-2.5 rounded-full bg-[#0B2559] text-white text-sm font-bold hover:bg-[#113274] transition-colors flex items-center gap-2"
                  >
                    Next: Pricing & Amenities <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Amenities */}
            {editorStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Card 2: Pricing Base */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Step 2: Base Monthly Rates
                  </label>


                  {propertyType === 'entire_property' ? (
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">
                        Monthly Rent (Entire Property)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          value={roomPrices[0]}
                          onChange={(e) => {
                            const newPrices = [...roomPrices];
                            newPrices[0] = Number(e.target.value);
                            setRoomPrices(newPrices);
                          }}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-semibold outline-none focus:border-[#0A6FA8] transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: roomCount }).map((_, i) => (
                        <div key={i}>
                          <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">
                            Room {String.fromCharCode(65 + i)} Monthly Rate
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input
                              type="number"
                              value={roomPrices[i]}
                              onChange={(e) => {
                                const newPrices = [...roomPrices];
                                newPrices[i] = Number(e.target.value);
                                setRoomPrices(newPrices);
                              }}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-semibold outline-none focus:border-[#0A6FA8] transition-colors"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3.5: Extra Options (Pet/Parking) */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Extra Fees & Options (Per Stay)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">
                        Pet Fee (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          value={petFee}
                          onChange={(e) => setPetFee(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-semibold outline-none focus:border-[#0A6FA8] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">
                        Parking Fee (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          value={parkingFee}
                          onChange={(e) => setParkingFee(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-sm font-semibold outline-none focus:border-[#0A6FA8] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2 mt-2">
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white mb-1.5">
                        Custom Extra Options
                      </label>
                      <textarea
                        value={extraOptionsStr}
                        onChange={(e) => setExtraOptionsStr(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E1A2E] text-xs font-mono outline-none focus:border-[#0A6FA8] transition-colors h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4: Specialized Healthcare Amenities */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Specialized Healthcare Amenities
                  </label>
                  <div className="space-y-1 text-sm text-[#0B2559] dark:text-gray-300 font-medium">
                    <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={hasBlackout}
                        onChange={(e) => setHasBlackout(e.target.checked)}
                        className="rounded accent-[#0A6FA8]"
                      />
                      <span>100% Blackout Drapes (Zero Bleed)</span>
                    </label>
                    <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={hasQuietHours}
                        onChange={(e) => setHasQuietHours(e.target.checked)}
                        className="rounded accent-[#0A6FA8]"
                      />
                      <span>Enforced Quiet Hours (08:00–17:00)</span>
                    </label>
                    <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={hasScrubWasher}
                        onChange={(e) => setHasScrubWasher(e.target.checked)}
                        className="rounded accent-[#0A6FA8]"
                      />
                      <span>In-Unit Scrub Sanitizing Washer</span>
                    </label>
                    <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={hasDedicatedParking}
                        onChange={(e) => setHasDedicatedParking(e.target.checked)}
                        className="rounded accent-[#0A6FA8]"
                      />
                      <span>Dedicated Off-Street Parking Space</span>
                    </label>
                    <label className="p-2 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] flex items-center gap-2 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={hasFiberWifi}
                        onChange={(e) => setHasFiberWifi(e.target.checked)}
                        className="rounded accent-[#0A6FA8]"
                      />
                      <span>500+ Mbps Fiber Wi-Fi (Epic Charting)</span>
                    </label>
                  </div>
                </div>

                {/* Card 5: Cancellation Tier Selection */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Cancellation Policy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Flexible', 'Moderate', 'Strict'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCancellationTier(tier)}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          cancellationTier === tier
                            ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#15233a] font-bold text-[#0A6FA8]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        <div className="text-xs">{tier}</div>
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {cancellationTier === 'Flexible'
                      ? '100% refund up to 14 days prior to rotation'
                      : cancellationTier === 'Moderate'
                      ? '100% refund up to 30 days prior to rotation'
                      : '50% refund up to 30 days prior to rotation'}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setEditorStep(1)}
                    className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorStep(3)}
                    className="px-6 py-2.5 rounded-full bg-[#0B2559] text-white text-sm font-bold hover:bg-[#113274] transition-colors flex items-center gap-2"
                  >
                    Next: Media Hub <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Media Hub */}
            {editorStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-[#F4E2DC] text-[#A8452E] dark:bg-[#F4E2DC]/20 dark:text-[#F4E2DC] text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {isUploading && (
                  <div className="p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/30 text-[#0A6FA8] dark:text-[#3E9AD1] text-xs font-semibold flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>{uploadMessage}</span>
                    </div>
                    <span className="text-[11px] font-bold">Please wait</span>
                  </div>
                )}

                {/* Media Hub: Photo Uploads */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559] dark:text-white uppercase tracking-wider">
                        Step 3: Media Hub (Photos)
                      </label>
                      <p className="text-[11px] text-gray-500 mt-0.5">Showcase your property for traveling nurses &amp; allied clinicians</p>
                    </div>
                    <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">{listingPhotos.length} / 25 photos</span>
                  </div>

                  {/* Recommended Photo Breakdown Guide */}
                  <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#15233a] text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <div className="font-bold text-[#0B2559] dark:text-white mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#0A6FA8]">info</span>
                      <span>Recommended Photo Breakdown (Max 5MB per image, auto-compressed to WebP/JPEG):</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-gray-500 dark:text-gray-400 pl-1">
                      <li><strong>Bedrooms:</strong> 2–3 photos per bedroom</li>
                      <li><strong>Bathrooms:</strong> 1–2 photos per bathroom</li>
                      <li><strong>Kitchen &amp; Living Area:</strong> 3–4 photos</li>
                      <li><strong>Exterior, Parking &amp; Neighborhood:</strong> 2–3 photos</li>
                      <li><strong>Hospital Proximity / Commute markers:</strong> 1–2 photos</li>
                    </ul>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    id="photo-upload"
                    onChange={handlePhotoUpload}
                  />

                  {listingPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {listingPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img
                            src={photo.url}
                            alt={`Listing photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1">
                              Cover Photo
                            </div>
                          )}
                        </div>
                      ))}
                      {listingPhotos.length < 25 && (
                        <label
                          htmlFor="photo-upload"
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-[#0A6FA8] hover:border-[#0A6FA8] hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] cursor-pointer transition-all"
                        >
                          <span className="material-symbols-outlined text-2xl mb-1">add_a_photo</span>
                          <span className="text-xs font-medium">Add Photos</span>
                        </label>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="photo-upload"
                      className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-[#0A6FA8] hover:border-[#0A6FA8] hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-3xl mb-2">cloud_upload</span>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Click to upload photos (Max 25 photos, 5MB each)</span>
                      <span className="text-xs text-gray-400">JPEG, PNG, WEBP supported</span>
                    </label>
                  )}
                </div>

                {/* Media Hub: Document & Floor Plan Attachments */}
                <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold text-[#0B2559] dark:text-white uppercase tracking-wider">
                          Document &amp; Floor Plan Attachments (PDF)
                        </label>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">Optional</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Floor plans, parking instructions, or lease addendums</p>
                    </div>
                    <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">{listingDocuments.length} / 5 docs</span>
                  </div>

                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    id="doc-upload"
                    onChange={handleDocumentUpload}
                  />

                  {listingDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {listingDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#0E1A2E] border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[#0A6FA8]">picture_as_pdf</span>
                            <span className="text-xs font-bold text-[#0B2559] dark:text-white truncate max-w-xs">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove document"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ))}
                      {listingDocuments.length < 5 && (
                        <label
                          htmlFor="doc-upload"
                          className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 text-gray-400 hover:text-[#0A6FA8] hover:border-[#0A6FA8] hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] cursor-pointer transition-all text-xs font-bold"
                        >
                          <span className="material-symbols-outlined text-[18px]">upload_file</span>
                          <span>Upload PDF Document (Max 10MB)</span>
                        </label>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="doc-upload"
                      className="w-full h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-[#0A6FA8] hover:border-[#0A6FA8] hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-2xl mb-1">picture_as_pdf</span>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-0.5">Click to upload floor plans or lease addendums</span>
                      <span className="text-[10px] text-gray-400">3 to 5 PDF documents up to 10MB each</span>
                    </label>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setEditorStep(2)}
                    className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="px-5 py-2.5 rounded-full border border-[#0A6FA8] text-[#0A6FA8] dark:text-[#3E9AD1] text-sm font-bold hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>Preview Listing</span>
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-sm font-bold shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUploading ? (
                          <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving...</>
                        ) : (
                          <><span className="material-symbols-outlined text-[18px]">{(!currentUser?.isHostVerified || !payoutsEnabled) ? 'save' : 'publish'}</span> {(!currentUser?.isHostVerified || !payoutsEnabled) ? 'Save Draft' : 'Publish Listing'}</>
                        )}
                      </button>
                      {(!currentUser?.isHostVerified || !payoutsEnabled) && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold mt-1">
                          Cannot publish until Stripe & Admin verification complete.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <ListingDetailModal
          listing={previewListingObject}
          onClose={() => setIsPreviewOpen(false)}
          isNightShiftMode={isNightShiftMode}
          isSaved={false}
          onToggleSave={() => {}}
          isVerified={true}
          onGoToVerification={() => {}}
        />
      )}

      {/* Host Onboarding & Identity Verification - 3-Card Responsive Grid */}
      {activeHostTab === 'onboarding' && (
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] uppercase tracking-wider">
              Host Onboarding &amp; Verification
            </span>
            <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Host Identity &amp; Authority to List</h2>
            <p className="text-xs text-gray-500">Required prior to publishing units on the traveling clinician search map</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">1. Photo ID &amp; Biometrics</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Government photo identification and facial liveness match for host authenticity.
                </p>
              </div>
              {currentUser?.isIdVerified ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Verified RealID</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500 pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  <span>Verification Pending</span>
                </div>
              )}
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">2. Authority to List</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Property deed, property tax receipt, or master lease sublease authorization.
                </p>
              </div>
              {currentUser?.isHostVerified ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Deed Verified on File</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500 pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  <span>Verification Pending</span>
                </div>
              )}
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0B2559] dark:text-white">3. Payout Account</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Direct deposit routing to receive automatic monthly disbursements on booking acceptance.
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550] flex flex-col gap-2">
                {isConnectingStripe ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    <span>Connecting bank routing...</span>
                  </div>
                ) : payoutsEnabled ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db]">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Direct Payouts Active</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleConnectStripe}
                      className="w-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                      <span>Connect via Stripe</span>
                    </button>
                  </div>
                )}
                {stripeError && (
                  <div className="text-xs text-[#D93025] dark:text-[#F28B82] bg-[#FCE8E6] dark:bg-[rgba(217,48,37,0.1)] p-2 rounded-md font-medium leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[14px] mt-0.5">error</span>
                      <span>{stripeError}</span>
                    </div>
                  </div>
                )}
                {/* Sandbox QA Reset Utility */}
                <div className="pt-2 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550] flex items-center justify-between text-[11px] text-gray-400">
                  <span>Sandbox Test Mode</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Disconnect Stripe test account and start afresh?')) {
                        try {
                          await fetch('/api/stripe/test-reset-account', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hostId }),
                          });
                          setPayoutsEnabled(false);
                          setStripeConnectInstance(null);
                          setShowEmbeddedOnboarding(false);
                        } catch (e) {
                          console.error('Reset failed:', e);
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700 underline font-medium cursor-pointer"
                  >
                    Reset Stripe Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Connect Onboarding Scrollable Modal */}
      {showEmbeddedOnboarding && stripeConnectInstance && (
        <div className="fixed inset-0 z-[150] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl w-full max-w-3xl my-auto max-h-[85vh] flex flex-col shadow-2xl border border-[rgba(11,37,89,0.16)] dark:border-[#233550] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0E1A2E]/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2559] dark:text-white">Stripe Payout Verification</h3>
                  <p className="text-xs text-gray-500">Secure Identity & Bank Account Setup</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setShowEmbeddedOnboarding(false);
                  try {
                    const res = await fetch(`/api/stripe/sync-payout-status?hostId=${hostId}`);
                    const data = await res.json();
                    if (data.payouts_enabled) {
                      setPayoutsEnabled(true);
                    }
                  } catch (e) {}
                  fetchPayoutStatus();
                }}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isStripeLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#0A6FA8]/20 border-t-[#0A6FA8] animate-spin"></div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-[#0B2559] dark:text-white">Establishing Secure Stripe Session...</p>
                    <p className="text-xs text-gray-500">Initializing Stripe Connect Accounts v2</p>
                  </div>
                  <div className="w-full max-w-md space-y-3 pt-4">
                    <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    <div className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                  <ConnectAccountOnboarding
                    onExit={async () => {
                      setShowEmbeddedOnboarding(false);
                      try {
                        const res = await fetch(`/api/stripe/sync-payout-status?hostId=${hostId}`);
                        const data = await res.json();
                        if (data.payouts_enabled) {
                          setPayoutsEnabled(true);
                        }
                      } catch (e) {}
                      fetchPayoutStatus();
                    }}
                  />
                </ConnectComponentsProvider>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
