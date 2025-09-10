// Sikkim Monasteries Website JavaScript (lowercase filename for consistent linking)

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Initialize all interactive features
    initializeFilters();
    initializeGallery();
    initializeMap();
    initializeContactForm();
    initializeEventFilters();
    initializeCoverflow();
    initializeFeatureModal();
    initializeEventModal();
    initializeChatbot();
    initializeVoiceGuide();
    initializeMonasteryModal();
    loadMonasteriesInfo();
    buildCoverflowFromMonasteries();

    // Hero parallax effect
    const hero = document.querySelector('.hero-section');
    const heroParallax = document.getElementById('hero-parallax');
    if (hero && heroParallax) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
            heroParallax.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        hero.addEventListener('mouseleave', () => {
            heroParallax.style.transform = 'translate3d(0,0,0)';
        });
    }

    // Hide preloader on full load with a minimum visible time + hard fallback timeout
    const PRELOADER_MIN_MS = 400; // shorter minimum to reduce perceived wait
    const PRELOADER_HARD_TIMEOUT_MS = 1500; // faster hard fallback
    const preloaderStart = Date.now();
    function hidePreloader() {
        const pre = document.getElementById('preloader');
        if (!pre) return;
        pre.style.transition = 'opacity .6s ease';
        pre.style.opacity = '0';
        setTimeout(() => pre.remove(), 650);
    }
    window.addEventListener('load', function() {
        const pre = document.getElementById('preloader');
        if (!pre) return;
        const elapsed = Date.now() - preloaderStart;
        const wait = Math.max(0, PRELOADER_MIN_MS - elapsed);
        setTimeout(hidePreloader, wait);
    });
    // Hard fallback to ensure preloader disappears even if some assets stall
    setTimeout(hidePreloader, PRELOADER_HARD_TIMEOUT_MS);
});

// Monastery Directory Filters
function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const popularityFilter = document.getElementById('popularity-filter');
    const ageFilter = document.getElementById('age-filter');
    const monasteryCards = document.querySelectorAll('.monastery-card');

    function filterMonasteries() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const regionValue = regionFilter ? regionFilter.value : '';
        const popularityValue = popularityFilter ? popularityFilter.value : '';
        const ageValue = ageFilter ? ageFilter.value : '';

        monasteryCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const region = card.dataset.region;
            const popularity = card.dataset.popularity;
            const age = card.dataset.age;

            const matchesSearch = !searchTerm || 
                title.includes(searchTerm) || 
                description.includes(searchTerm);
            
            const matchesRegion = !regionValue || region === regionValue;
            const matchesPopularity = !popularityValue || popularity === popularityValue;
            const matchesAge = !ageValue || age === ageValue;

            if (matchesSearch && matchesRegion && matchesPopularity && matchesAge) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Add event listeners
    if (searchInput) searchInput.addEventListener('input', filterMonasteries);
    if (regionFilter) regionFilter.addEventListener('change', filterMonasteries);
    if (popularityFilter) popularityFilter.addEventListener('change', filterMonasteries);
    if (ageFilter) ageFilter.addEventListener('change', filterMonasteries);

    // Load more functionality
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = '<span class="loading"></span> Loading...';
            appendMonasteriesBatch(12).then((hasMore) => {
                this.innerHTML = hasMore ? 'Load More Monasteries' : 'All Monasteries Loaded';
                if (!hasMore) {
                    this.disabled = true;
                    this.classList.add('opacity-60', 'cursor-not-allowed');
                }
            });
        });
    }
}

// Photo Gallery
function initializeGallery() {
    const galleryImages = [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ];
    
    let currentImageIndex = 0;
    const galleryMain = document.getElementById('gallery-main');
    
    window.changeSlide = function(direction) {
        currentImageIndex += direction;
        
        if (currentImageIndex >= galleryImages.length) {
            currentImageIndex = 0;
        } else if (currentImageIndex < 0) {
            currentImageIndex = galleryImages.length - 1;
        }
        
        if (galleryMain) {
            galleryMain.src = galleryImages[currentImageIndex];
        }
    };
    
    window.setMainImage = function(src) {
        if (galleryMain) {
            galleryMain.src = src;
        }
        
        // Update thumbnail borders
        const thumbnails = document.querySelectorAll('.gallery-container img[onclick]');
        thumbnails.forEach(thumb => {
            thumb.classList.remove('border-red-600');
            thumb.classList.add('border-transparent');
            if (thumb.src === src) {
                thumb.classList.remove('border-transparent');
                thumb.classList.add('border-red-600');
            }
        });
    };
}

// Interactive Map
function initializeMap() {
    const mapMarkers = document.querySelectorAll('.map-marker');
    const filterButtons = {
        'show-all': document.getElementById('show-all'),
        'filter-gangtok': document.getElementById('filter-gangtok'),
        'filter-pelling': document.getElementById('filter-pelling'),
        'filter-north': document.getElementById('filter-north')
    };

    // Marker click events
    mapMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const popup = this.querySelector('.marker-popup');
            if (popup) {
                // Hide other popups
                document.querySelectorAll('.marker-popup').forEach(p => p.style.display = 'none');
                // Show this popup
                popup.style.display = 'block';
            }
        });
    });

    // Filter buttons
    Object.keys(filterButtons).forEach(key => {
        const button = filterButtons[key];
        if (button) {
            button.addEventListener('click', function() {
                // Reset all buttons
                Object.values(filterButtons).forEach(btn => {
                    if (btn) {
                        btn.classList.remove('bg-red-600', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700');
                    }
                });
                
                // Highlight current button
                this.classList.remove('bg-gray-200', 'text-gray-700');
                this.classList.add('bg-red-600', 'text-white');
                
                // Filter markers
                const region = key.replace('filter-', '');
                mapMarkers.forEach(marker => {
                    if (key === 'show-all' || marker.dataset.region === region) {
                        marker.style.display = 'block';
                    } else {
                        marker.style.display = 'none';
                    }
                });
            });
        }
    });

    // View monastery function
    window.viewMonastery = function(monasteryId) {
        window.location.href = `monastery-detail.html?id=${monasteryId}`;
    };

    // Zoom controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    
    if (zoomIn) {
        zoomIn.addEventListener('click', function() {
            console.log('Zoom in');
        });
    }
    
    if (zoomOut) {
        zoomOut.addEventListener('click', function() {
            console.log('Zoom out');
        });
    }
}

// Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// Event Filters
function initializeEventFilters() {
    const filterButtons = {
        'all-events': document.getElementById('all-events'),
        'upcoming-events': document.getElementById('upcoming-events'),
        'festivals': document.getElementById('festivals'),
        'ceremonies': document.getElementById('ceremonies'),
        'dances': document.getElementById('dances')
    };
    
    const eventCards = document.querySelectorAll('.event-card');
    
    Object.keys(filterButtons).forEach(key => {
        const button = filterButtons[key];
        if (button) {
            button.addEventListener('click', function() {
                // Reset all buttons
                Object.values(filterButtons).forEach(btn => {
                    if (btn) {
                        btn.classList.remove('bg-red-600', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700');
                    }
                });
                
                // Highlight current button
                this.classList.remove('bg-gray-200', 'text-gray-700');
                this.classList.add('bg-red-600', 'text-white');
                
                // Filter events
                const category = key.replace('-events', '').replace('-', '');
                eventCards.forEach(card => {
                    if (key === 'all-events' || card.dataset.category === category) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease-in';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    });
}

// Events page: Learn More modal
function initializeEventModal() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;
    const backdrop = modal.querySelector('.feature-modal-backdrop');
    const dialog = modal.querySelector('.feature-modal-dialog');
    const closeBtn = modal.querySelector('.feature-modal-close');

    const imgEl = document.getElementById('event-image');
    const titleEl = document.getElementById('event-title');
    const subtitleEl = document.getElementById('event-subtitle');
    const dateEl = document.getElementById('event-date');
    const durationEl = document.getElementById('event-duration');
    const locationEl = document.getElementById('event-location');
    const descEl = document.getElementById('event-description');
    const factsEl = document.getElementById('event-facts');

    function openFromCard(card) {
        const img = card.querySelector('img');
        const title = card.querySelector('h3');
        const subtitle = card.querySelector('p.text-gray-600');
        const detailItems = Array.from(card.querySelectorAll('.flex.items-center.mb-4.text-sm.text-gray-600 span'));
        const desc = card.querySelector('p.text-gray-700');

        if (imgEl && img) imgEl.src = img.src;
        if (titleEl && title) titleEl.textContent = title.textContent.trim();
        if (subtitleEl && subtitle) subtitleEl.textContent = subtitle.textContent.trim();
        if (detailItems[0]) dateEl.textContent = detailItems[0].textContent.trim();
        if (detailItems[1]) durationEl.textContent = detailItems[1].textContent.trim();
        if (detailItems[2]) locationEl.textContent = detailItems[2].textContent.trim();

        // Provide a richer, non-duplicate description for the modal
        if (descEl) {
            const titleText = (title ? title.textContent : '').toLowerCase();
            let modalDesc = '';
            if (titleText.includes('losar')) {
                modalDesc = 'At Rumtek, monks prepare intricate tormas (butter sculptures) and households exchange khata scarves for auspicious beginnings. Dawn smoke offerings and drum processions usher in the Tibetan New Year with blessings for prosperity.';
            } else if (titleText.includes('saga dawa')) {
                modalDesc = 'Devotees perform kora around stupas and monasteries, light rows of butter lamps, and dedicate prayers to all beings. Acts of generosity and refraining from harm are emphasized as merit is believed to multiply.';
            } else if (titleText.includes('tsechu')) {
                modalDesc = 'Cham dancers embody guardian deities through sacred choreography, while long horns and cymbals set a resonant cadence. Blessings are bestowed with relics and ritual implements between performances.';
            } else if (titleText.includes('guru rinpoche')) {
                modalDesc = 'The day honors Padmasambhava’s blessings with mantra recitations, offerings, and teachings. Many monasteries unfurl large thangkas and lead devotees in supplications for protection and wisdom.';
            } else if (titleText.includes('lhabab duchen')) {
                modalDesc = 'Marking Buddha’s descent from Tushita heaven, this day highlights study, contemplation, and compassionate action. Communities renew prayer flags and support temple upkeep as devotional service.';
            } else {
                modalDesc = (desc ? desc.textContent.trim() : 'Experience sacred rituals, community offerings, and vibrant cultural expressions unique to Sikkim’s monasteries.');
            }
            descEl.textContent = modalDesc;
        }

        // Inject interesting, non-duplicate facts based on event title
        if (factsEl) {
            const titleText = (title ? title.textContent : '').toLowerCase();
            let facts = [];
            if (titleText.includes('losar')) {
                facts = [
                    'Butter sculptures (tormas) are crafted and offered during rituals.',
                    'Households prepare khapse (fried pastry) as a festive treat.',
                    'Monks perform smoke offerings to purify and welcome the new year.'
                ];
            } else if (titleText.includes('saga dawa')) {
                facts = [
                    'Merit is believed to be multiplied many times on this day.',
                    'Devotees practice kora (circumambulation) around sacred sites.',
                    'Butter lamps are lit continuously as an offering of light.'
                ];
            } else if (titleText.includes('tsechu')) {
                facts = [
                    'Cham masks represent protective deities and historic figures.',
                    'Costumes often include brocade robes and yak-hair ornaments.',
                    'Audiences receive blessings from sacred relics displayed.'
                ];
            } else if (titleText.includes('guru rinpoche')) {
                facts = [
                    'Mantras of Padmasambhava (Om Ah Hum Vajra Guru Padma Siddhi Hum) are widely recited.',
                    'Devotees make flower and incense offerings at dawn.',
                    'Monasteries display thangkas depicting Guru Rinpoche’s eight manifestations.'
                ];
            } else if (titleText.includes('lhabab duchen')) {
                facts = [
                    'Acts of generosity are emphasized as highly meritorious.',
                    'Texts recount Buddha’s teaching to his mother in the Tushita heaven.',
                    'Prayer flags are renewed to carry blessings on the wind.'
                ];
            } else {
                facts = [
                    'Local artisans showcase traditional crafts during the event.',
                    'Community kitchens prepare shared vegetarian meals for visitors.',
                    'Guided chanting sessions introduce visitors to sacred verses.'
                ];
            }
            factsEl.innerHTML = '';
            facts.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                factsEl.appendChild(li);
            });
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (dialog) dialog.style.transform = 'scale(1)';
    }

    document.querySelectorAll('.event-card .event-learn-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.event-card');
            if (card) openFromCard(card);
        });
    });

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// Simple chatbot toggle and echo behavior
function initializeChatbot() {
    const fab = document.getElementById('chat-fab');
    const panel = document.getElementById('chat-panel');
    const close = document.getElementById('chat-close');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-text');
    const messages = document.getElementById('chat-messages');
    if (!fab || !panel || !form || !input || !messages) return;

    const open = () => { panel.classList.remove('hidden'); setTimeout(() => input.focus(), 50); };
    const hide = () => { panel.classList.add('hidden'); };

    fab.addEventListener('click', open);
    if (close) close.addEventListener('click', hide);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        appendMsg('user', text);
        input.value = '';
        setTimeout(() => {
            const reply = generateBotReply(text);
            appendMsg('bot', reply);
            messages.scrollTop = messages.scrollHeight;
        }, 400);
    });

    function appendMsg(role, text) {
        const el = document.createElement('div');
        el.className = 'msg ' + role;
        el.textContent = text;
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
    }

    function generateBotReply(text) {
        const t = text.toLowerCase();
        if (t.includes('event') || t.includes('festival')) return 'Check the Events page for dates, venues, and details. Use Learn More to see highlights.';
        if (t.includes('map')) return 'Open the Map to view markers and filter regions like Gangtok and North.';
        if (t.includes('plan') || t.includes('visit')) return 'Best time: Mar–May, Sep–Nov. Dress modestly, maintain silence in prayer halls.';
        if (t.includes('hello') || t.includes('hi')) return 'Hello! How can I help you explore Sikkim’s monasteries today?';
        return 'I can guide you to monasteries, events, and planning tips. Try asking “Show top monasteries in Gangtok”.';
    }
}

// Audio guide (placeholder with basic controls; GPS can be attached later)
function initializeVoiceGuide() {
    const fab = document.getElementById('voice-fab');
    const panel = document.getElementById('voice-panel');
    const close = document.getElementById('voice-close');
    const playBtn = document.getElementById('voice-play');
    const pauseBtn = document.getElementById('voice-pause');
    const stopBtn = document.getElementById('voice-stop');
    if (!fab || !panel || !playBtn || !pauseBtn || !stopBtn) return;

    const open = () => panel.classList.remove('hidden');
    const hide = () => panel.classList.add('hidden');
    fab.addEventListener('click', open);
    if (close) close.addEventListener('click', hide);

    // Basic narration using Web Speech API (if available) as a placeholder
    const synth = window.speechSynthesis;
    let utterance = null;

    function speak(text) {
        if (!synth) return;
        stopSpeech();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.lang = 'en-IN';
        synth.speak(utterance);
    }

    function pauseSpeech() { if (synth && synth.speaking && !synth.paused) synth.pause(); }
    function resumeSpeech() { if (synth && synth.paused) synth.resume(); }
    function stopSpeech() { if (synth && synth.speaking) { synth.cancel(); } }

    playBtn.addEventListener('click', () => {
        const sample = 'Welcome to the Sikkim audio guide. Nearby highlights include Rumtek, Enchey, and Pemayangtse Monasteries. This guide will adapt to your location once GPS is connected.';
        if (synth && synth.paused) { resumeSpeech(); } else { speak(sample); }
    });
    pauseBtn.addEventListener('click', () => pauseSpeech());
    stopBtn.addEventListener('click', () => stopSpeech());
}

// Monastery details modal for cards on monasteries.html
function initializeMonasteryModal() {
    const grid = document.getElementById('monasteries-grid');
    const modal = document.getElementById('monastery-modal');
    if (!grid || !modal) return;

    const backdrop = modal.querySelector('.feature-modal-backdrop');
    const dialog = modal.querySelector('.feature-modal-dialog');
    const closeBtn = modal.querySelector('.feature-modal-close');
    const imgEl = document.getElementById('monastery-image');
    const titleEl = document.getElementById('monastery-title');
    const aboutEl = document.getElementById('monastery-about');
    const pointsEl = document.getElementById('monastery-points');

    // Fallback inline info (will be overridden by external JSON if provided)
    let info = {
        'Amba Mamring Monastery': {
            about: 'Located in East Sikkim; a quiet, historically significant institution serving local devotees.',
            points: ['Key spiritual center for locals','Preserves regional practices and traditions','Contributes to a peaceful atmosphere']
        },
        'Bakcham Monastery': {
            about: 'Smaller monastery in East Sikkim; vital hub for prayer, meditation and instruction.',
            points: ['Center for teachings and rituals','Fosters community spirit','Helps continue Buddhist traditions']
        },
        'Bongyong Ani Gonpa': {
            about: 'A nunnery dedicated to female monastic life and study in East Sikkim.',
            points: ['Sanctuary for female monastics','Promotes gender inclusion','Sustains women’s spiritual practice']
        },
        'Burtuk Ugen Pemacholing Monastery': {
            about: 'Near Gangtok; noted for serene environs and traditional Sikkimese architecture.',
            points: ['Retreat for meditation','Pilgrimage hub','Traditional Sikkimese architecture']
        },
        'Choten Monastery': {
            about: 'Also called Chorten Gompa near Gangtok; centered around a prominent stupa.',
            points: ['Stupa is a major landmark','Center for worship and meditation','Focal point for ceremonies']
        },
        'Dichen Choling Monastery': {
            about: 'Quiet East Sikkim monastery focused on preserving teachings and education.',
            points: ['Center for education and practice','Preserves ancient traditions','Fosters community']
        },
        'Dolepchen Boudha Sanskrit Monastery': {
            about: 'Bridges Buddhist and Sanskrit studies with academic and spiritual focus.',
            points: ['Preserves Sanskrit','Bridges traditions','Academic and spiritual center']
        },
        'Duchi Gyalton Monastery': {
            about: 'Ancient monastery in East Sikkim known for its long spiritual lineage.',
            points: ['Significant historical lineage','Preserves age‑old practices','Beacon of wisdom']
        },
        'Enchey Monastery': {
            about: 'Hilltop monastery above Gangtok, established in 1909; Nyingma school.',
            points: ['Major pilgrimage site','Hosts Chaam masked dances','Key monastery in Sikkim']
        },
        'Kagon Tshechhogling Monastery': {
            about: 'Important center in East Sikkim serving local ceremonies and festivals.',
            points: ['Center for rituals','Hosts festivals','Maintains values']
        },
        'Kathog Dorjeden Monastery': {
            about: 'One of the oldest; replica of Tibetan Kathog Monastery; Nyingma tradition.',
            points: ['Historic and spiritual value','Preserves Kathog lineage','Tibetan cultural link']
        },
        'Khatek Pema Choling Monastery': {
            about: 'Secluded East Sikkim monastery fostering meditation and practice.',
            points: ['Deep practice and meditation','Supports local religious life','Secluded refuge']
        },
        'Lingdok Tsangkhar Monastery': {
            about: 'Serves Lingdok region with education and community events.',
            points: ['Community spiritual center','Religious education','Strong local ties']
        },
        'Lingdum (Zurmang) Monastery': {
            about: 'Large monastery near Gangtok of the Zurmang Kagyud lineage; major study center.',
            points: ['Global teaching center','Grand architecture','Important Kagyud seat']
        },
        'Linkoed Monastery': {
            about: 'Rural East Sikkim monastery serving nearby villages with prayer and ceremonies.',
            points: ['Vital village center','Upholds values','Fosters community']
        },
        'Martam Tsangkhar Monastery': {
            about: 'Monastery in Martam area strengthening spiritual well‑being and ceremonies.',
            points: ['Supports spiritual life','Hosts ceremonies','Builds community bonds']
        },
        'Old Rumtek Monastery': {
            about: 'Original Karma Kagyu seat predating the Dharma Chakra Centre.',
            points: ['Historic and spiritual value','Original Kagyu seat','Early Buddhist history']
        },
        'Pabyuk Monastery': {
            about: 'Secluded East Sikkim monastery with traditional lifestyle and deep practice.',
            points: ['Supports local religious life','Traditional monastic lifestyle','Peaceful practice']
        },
        'Pandam Monastery': {
            about: 'Pandam region spiritual hub preserving customs and traditions.',
            points: ['Community focal point','Preserves customs','Vital to spiritual fabric']
        },
        'Pathing Matsang Monastery': {
            about: 'Smaller Pathing monastery serving worship and instruction in rural Sikkim.',
            points: ['Place for worship/instruction','Continues rural practices','Key to community life']
        },
        'Radong Tensung Monastery': {
            about: 'Old monastery valued for historical lineage and preserved texts.',
            points: ['Rich historical lineage','Preserves ancient texts','Historical/spiritual value']
        },
        'Raloong Monastery': {
            about: 'East Sikkim monastery supporting worship and monastic education.',
            points: ['Supports worship','Monastic education','Local religious landscape']
        },
        'Ray Mindu Katenling Monastery': {
            about: 'Ray region center hosting rituals central to community life.',
            points: ['Village spiritual center','Hosts key ceremonies','Shapes spiritual identity']
        },
        'Rinak Monastery': {
            about: 'Old Rinak monastery—beacon of teachings and repository of wisdom.',
            points: ['Historic and spiritual','Beacon of teachings','Ancient wisdom']
        },
        'Rumtek Dharma Chakra Centre': {
            about: 'Largest monastery; seat of Gyalwa Karmapa; major Kagyu center.',
            points: ['Global Kagyu center','Significant outside Tibet','Preserves Tibetan Buddhism']
        },
        'Samdong Mintokgang Monastery': {
            about: 'Peaceful Samdong hub for meditation, prayer and gatherings.',
            points: ['Local religious hub','Meditation space','Reinforces bonds']
        },
        'Sang Monastery': {
            about: 'Vital center in Sang region preserving rituals and culture.',
            points: ['Local worship center','Preserves rituals','Cultural role']
        },
        'Sang-Ngor Monastery (Sa-Ngor)': {
            about: 'Branch of Ngor tradition (Sakya school); rare Sakya center in Sikkim.',
            points: ['Unique Sakya monastery','Preserves Ngor lineage','Important lineage center']
        },
        'Simig Monastery': {
            about: 'Rural East Sikkim monastery maintaining practices and community spirit.',
            points: ['Crucial to local life','Maintains practices','Fosters community']
        },
        'Singtam Monastery': {
            about: 'Religious and cultural hub near Singtam; hosts festivals and events.',
            points: ['Town hub','Hosts festivals','Central to identity']
        },
        'Sumon Thubten Gatsalling Monastery': {
            about: 'Sumon area monastery—center for learning and training monks.',
            points: ['Spiritual learning','Monastic heritage','Trains new monks']
        },
        'Taglung Domsumling Monastery': {
            about: 'Ancient monastery preserving founding lamas’ lineage.',
            points: ['Historic significance','Preserves lineage','Deep local roots']
        },
        'Taktse (Taktse Ani) Gonpa': {
            about: 'Nunnery near Taktse supporting women’s study and practice.',
            points: ['Space for female monastics','Supports women','Empowers journeys']
        },
        'Thumon Monastery': {
            about: 'Tranquil secluded monastery; refuge for meditation and study.',
            points: ['Refuge for meditation','Secluded environment','Center for study']
        },
        'Tingkye Gonjang Monastery': {
            about: 'Smaller Tingkye monastery serving local activities and traditions.',
            points: ['Religious activities','Preserves traditions','Community presence']
        },
        'Tsangek Monastery': {
            about: 'Significant local site with regular prayers and ceremonies.',
            points: ['Local significance','Regular ceremonies','Daily spiritual role']
        },
        'Tsuklakhang (Tsulakhang) Monastery / Royal Chapel': {
            about: 'Former royal chapel in Gangtok; central for royal ceremonies and festivals.',
            points: ['Cultural and historical','Former royal chapel','Venue for ceremonies']
        },
        'Karthok Monastery': {
            about: 'Older revered monastery in North Sikkim; cultural hub preserving practices.',
            points: ['Vital spiritual center','Preserves practices','Cultural hub']
        },
        'Lachen Monastery': {
            about: 'Prominent hub for Lachenpas; starting point for pilgrims.',
            points: ['Religious/cultural hub','Pilgrimage start','Crucial to community']
        },
        'Lachung Monastery': {
            about: 'Hilltop landmark above Lachung; central for worship and festivals.',
            points: ['Cultural/religious landmark','Central worship place','Festival hub']
        },
        'Pemayangtse Monastery': {
            about: 'Head monastery of Nyingma school; major pilgrimage and education center.',
            points: ['Head of Nyingma in Sikkim','Famous and important','Pilgrimage/education center']
        },
        'Tashiding Monastery': {
            about: 'One of the most sacred; associated with enlightenment and Bumchu festival.',
            points: ['Highly sacred','Place to attain merit','Hosts Bumchu festival']
        }
    };

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.monastery-card');
        if (!card) return;
        const title = card.querySelector('h3');
        if (!title) return;
        openModal(title.textContent.trim(), card.querySelector('img')?.src || '');
    });

    function openModal(name, imgSrc) {
        if (titleEl) titleEl.textContent = name;
        if (imgEl) imgEl.src = imgSrc;
        // Prefer comprehensive JSON if loaded
        const data = (MONASTERIES_INFO && MONASTERIES_INFO[name]) ? MONASTERIES_INFO[name] : info[name];
        if (aboutEl) aboutEl.textContent = data ? data.about : 'Details coming soon.';
        if (pointsEl) {
            pointsEl.innerHTML = '';
            (data ? data.points : ['Spiritual site','Local heritage','Peaceful atmosphere']).forEach(p => {
                const li = document.createElement('li');
                li.textContent = p;
                pointsEl.appendChild(li);
            });
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (dialog) dialog.style.transform = 'scale(1)';
    }

    function close() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (backdrop) backdrop.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// Load comprehensive monastery descriptions (About + points) from JSON if available
let MONASTERIES_INFO = null;
function loadMonasteriesInfo() {
    fetch('assets/monasteries_info.json', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && typeof data === 'object') {
                MONASTERIES_INFO = data;
                // Re-apply detail info after JSON arrives (details page)
                applyMonasteryDetailInfo();
            }
        })
        .catch(() => {});
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #dc2626;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Update monastery details page from slug using comprehensive info map
const monasteryId = getUrlParameter('id');
if (monasteryId) {
    // Minimal info set derived from the modal info above
    const DETAIL_INFO = {
        'rumtek-dharma-chakra-centre': {
            title: 'Rumtek Dharma Chakra Centre',
            about: 'Largest monastery and seat of the Gyalwa Karmapa; major Kagyu center preserving Tibetan Buddhism.',
            points: ['Global Kagyu center','Significant outside Tibet','Major festivals and teachings']
        },
        'pemayangtse-monastery': {
            title: 'Pemayangtse Monastery',
            about: 'Head monastery of the Nyingma school in Sikkim; founded in the 17th century near Pelling.',
            points: ['Head of Nyingma in Sikkim','Famous and important','Pilgrimage and education center']
        },
        'enchey-monastery': {
            title: 'Enchey Monastery',
            about: 'Hilltop Nyingma monastery above Gangtok, established in 1909; name means “solitary temple.”',
            points: ['Major pilgrimage site','Hosts Chaam masked dances','Historic spiritual seat']
        },
        'lachung-monastery': {
            title: 'Lachung Monastery',
            about: 'Prominent cultural and religious landmark above Lachung; hub for community worship and festivals.',
            points: ['Cultural and religious landmark','Central worship place','Festival hub']
        },
        'lachen-monastery': {
            title: 'Lachen Monastery',
            about: 'Prominent hub for the Lachenpa community and a starting point for northern pilgrimages.',
            points: ['Religious and cultural hub','Pilgrimage start','Crucial to community']
        },
        'tashiding-monastery': {
            title: 'Tashiding Monastery',
            about: 'One of the most sacred in Sikkim; associated with the Bumchu festival and spiritual merit.',
            points: ['Highly sacred','Place to attain merit','Hosts Bumchu festival']
        }
    };

    // If external JSON has a title key matching current page, prefer that
    applyMonasteryDetailInfo();
}

function applyMonasteryDetailInfo() {
    const id = getUrlParameter('id');
    if (!id) return;
    // Legacy short ids → display names
    const LEGACY_ID_TO_NAME = {
        'rumtek': 'Rumtek Dharma Chakra Centre',
        'pemayangtse': 'Pemayangtse Monastery',
        'enchey': 'Enchey Monastery',
        'lachung': 'Lachung Monastery',
        'lachen': 'Lachen Monastery',
        'tashiding': 'Tashiding Monastery'
    };
    const displayName = LEGACY_ID_TO_NAME[id] || Object.keys(MONASTERIES_INFO || {}).find(k => slugify(k) === id) || null;
    let fromJson = null;
    if (displayName && MONASTERIES_INFO && MONASTERIES_INFO[displayName]) {
        fromJson = MONASTERIES_INFO[displayName];
    }
    const info = fromJson || DETAIL_INFO[id] || (displayName && DETAIL_INFO[slugify(displayName)]);
    if (!info) return;

    const titleElement = document.getElementById('monastery-title');
    const subtitleElement = document.getElementById('monastery-subtitle');
    const aboutEl = document.getElementById('monastery-about');
    const pointsEl = document.getElementById('monastery-points');
    if (titleElement) titleElement.textContent = info.title || displayName || 'Monastery';
    const about = info.about || '';
    if (subtitleElement) subtitleElement.textContent = about || (info.subtitle || '');
    if (aboutEl) aboutEl.textContent = about || 'Details coming soon.';
    if (pointsEl) {
        pointsEl.innerHTML = '';
        (info.points && info.points.length ? info.points : ['Spiritual site','Local heritage','Peaceful atmosphere']).forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            pointsEl.appendChild(li);
        });
    }
}

// Add scroll-to-top functionality
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        // Show scroll to top button if it doesn't exist
        if (!document.getElementById('scroll-to-top')) {
            const scrollBtn = document.createElement('button');
            scrollBtn.id = 'scroll-to-top';
            scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            scrollBtn.className = 'fixed bottom-6 right-6 bg-red-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-red-700 transition duration-300 z-50';
            scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.appendChild(scrollBtn);
        }
    } else {
        const scrollBtn = document.getElementById('scroll-to-top');
        if (scrollBtn) {
            scrollBtn.remove();
        }
    }
});

// 3D Coverflow Initialization
function initializeCoverflow() {
    const container = document.getElementById('coverflow');
    if (!container) return;

    const track = container.querySelector('.coverflow-track');
    const slides = Array.from(container.querySelectorAll('.coverflow-slide'));
    if (!slides || slides.length === 0) {
        // Nothing to initialize yet
        return;
    }
    const prevBtn = container.querySelector('.coverflow-btn.prev');
    const nextBtn = container.querySelector('.coverflow-btn.next');
    const dotsWrap = document.getElementById('coverflow-dots');
    const toggleBtn = document.getElementById('coverflow-toggle');
    const titleEl = document.getElementById('coverflow-title');
    const subtitleEl = document.getElementById('coverflow-subtitle');

    let centerIndex = 0;
    const dataCenter = container.getAttribute('data-center-index');
    if (dataCenter && !Number.isNaN(parseInt(dataCenter, 10))) {
        const parsed = parseInt(dataCenter, 10);
        if (parsed >= 0 && parsed < slides.length) {
            centerIndex = parsed;
        }
    }
    let autoplayTimer = null;
    const AUTOPLAY_MS = 3500;

    function applyClasses() {
        slides.forEach((s) => {
            s.classList.remove('is-center','is-left-1','is-right-1','is-left-2','is-right-2');
        });

        const total = slides.length;
        const left1 = (centerIndex - 1 + total) % total;
        const right1 = (centerIndex + 1) % total;
        const left2 = (centerIndex - 2 + total) % total;
        const right2 = (centerIndex + 2) % total;

        slides[centerIndex].classList.add('is-center');
        slides[left1].classList.add('is-left-1');
        slides[right1].classList.add('is-right-1');
        if (total > 3) {
            slides[left2].classList.add('is-left-2');
            slides[right2].classList.add('is-right-2');
        }

        // Caption
        const center = slides[centerIndex];
        if (titleEl) titleEl.textContent = center.getAttribute('data-title') || 'Sikkim Monasteries';
        if (subtitleEl) subtitleEl.textContent = center.getAttribute('data-subtitle') || 'A visual journey through sacred heritage';

        // Dots
        if (dotsWrap) {
            Array.from(dotsWrap.children).forEach((d, idx) => {
                d.classList.toggle('is-active', idx === centerIndex);
            });
        }
    }

    function go(delta) {
        centerIndex = (centerIndex + delta + slides.length) % slides.length;
        applyClasses();
        restartAutoplay();
    }

    let isPlaying = true;
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => go(1), AUTOPLAY_MS);
        isPlaying = true;
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
        isPlaying = false;
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    function restartAutoplay() {
        startAutoplay();
    }

    // Button events
    if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(1));
    if (toggleBtn) toggleBtn.addEventListener('click', () => {
        if (isPlaying) stopAutoplay(); else startAutoplay();
    });

    // Click slide to center
    slides.forEach((s, i) => {
        s.addEventListener('click', () => {
            if (i === centerIndex) return;
            const diff = (i - centerIndex + slides.length) % slides.length;
            go(diff);
        });
    });

    // Swipe support
    let startX = null;
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoplay();
    }, { passive: true });
    container.addEventListener('touchmove', (e) => {
        if (startX === null) return;
        const dx = e.touches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
            go(dx < 0 ? 1 : -1);
            startX = null;
        }
    }, { passive: true });
    container.addEventListener('touchend', () => {
        startX = null;
        startAutoplay();
    });

    // Keyboard support
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
    });

    // Initialize
    // Build dots
    if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach((_, i) => {
            const b = document.createElement('button');
            b.addEventListener('click', () => { centerIndex = i; applyClasses(); restartAutoplay(); });
            dotsWrap.appendChild(b);
        });
    }

    // Add fallback loader for missing local images
    slides.forEach((img) => {
        const applyFallback = () => {
            const fallback = img.getAttribute('data-fallback');
            if (fallback && img.src !== fallback) {
                img.src = fallback;
            }
        };

        // If it errors at any time, swap to fallback
        img.addEventListener('error', applyFallback, { once: true });

        // If it already failed before listeners attached, detect and swap
        if (img.complete && img.naturalWidth === 0) {
            applyFallback();
        } else {
            // Re-check shortly after load start to catch file:// timing quirks
            setTimeout(() => {
                if (img.complete && img.naturalWidth === 0) applyFallback();
            }, 500);
        }
    });
    applyClasses();
    startAutoplay();
}

// Build 3D coverflow slides from available local monastery images
function buildCoverflowFromMonasteries() {
    const container = document.getElementById('coverflow');
    if (!container) return;
    const track = container.querySelector('.coverflow-track');
    if (!track) return;

    // Use overrides map (local images the user provided)
    const entries = Object.entries(MONASTERY_IMAGE_OVERRIDES);
    if (!entries.length) return; // leave empty if none

    track.innerHTML = '';
    entries.forEach(([name, src]) => {
        const img = document.createElement('img');
        img.className = 'coverflow-slide';
        img.src = withCacheBuster(src);
        img.alt = name;
        img.loading = 'lazy';
        img.setAttribute('data-title', name);
        img.setAttribute('data-subtitle', 'Explore sacred heritage');
        track.appendChild(img);
    });

    // Re-init coverflow with new slides
    // Delay to ensure images are in DOM before initializing transforms
    setTimeout(() => initializeCoverflow(), 0);
}

// Feature Modal for Discover section
function initializeFeatureModal() {
    const data = {
        spiritual: {
            title: 'Spiritual Journey',
            desc: 'Experience the peace and tranquility of ancient Buddhist traditions.',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',
            facts: [
                'Morning prayers (puja) begin before sunrise in many monasteries.',
                'Colorful prayer flags symbolize peace, compassion, strength, and wisdom.',
                'Meditation halls are open to visitors during specific hours.'
            ]
        },
        mountain: {
            title: 'Mountain Views',
            desc: 'Witness breathtaking Himalayan landscapes from sacred heights.',
            image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=80',
            facts: [
                'Clear views during March–May and Sep–Nov.',
                'Some monasteries sit above 2,000 meters elevation.',
                'Sunrise offers the best golden hues on snow peaks.'
            ]
        },
        history: {
            title: 'Rich History',
            desc: 'Discover centuries-old traditions and cultural heritage.',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1400&q=80',
            facts: [
                'Monasteries house ancient manuscripts and thangka paintings.',
                'Many sites date back to the 17th–18th centuries.',
                'Annual cham dances depict stories of Dharma protectors.'
            ]
        }
    };

    const modal = document.getElementById('feature-modal');
    if (!modal) return;
    const backdrop = modal.querySelector('.feature-modal-backdrop');
    const dialog = modal.querySelector('.feature-modal-dialog');
    const closeBtn = modal.querySelector('.feature-modal-close');
    const imgEl = document.getElementById('feature-image');
    const titleEl = document.getElementById('feature-title');
    const descEl = document.getElementById('feature-desc');
    const factsEl = document.getElementById('feature-facts');

    function openModal(key) {
        const item = data[key];
        if (!item) return;
        if (imgEl) imgEl.src = item.image;
        if (titleEl) titleEl.textContent = item.title;
        if (descEl) descEl.textContent = item.desc;
        if (factsEl) {
            factsEl.innerHTML = '';
            item.facts.forEach(f => {
                const li = document.createElement('li');
                li.textContent = f;
                factsEl.appendChild(li);
            });
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (dialog) dialog.style.transform = 'scale(1)';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('click', () => openModal(item.getAttribute('data-key')));
    });

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// Master list of monasteries to append in batches
const MONASTERIES_MASTER = [
        'Amba Mamring Monastery','Bakcham Monastery','Bongyong Ani Gonpa','Burtuk Ugen Pemacholing Monastery','Choten Monastery','Dichen Choling Monastery','Dolepchen Boudha Sanskrit Monastery','Duchi Gyalton Monastery','Enchey Monastery','Kagon Tshechhogling Monastery','Kathog Dorjeden Monastery','Khatek Pema Choling Monastery','Lingdok Tsangkhar Monastery','Lingdum (Zurmang) Monastery','Linkoed Monastery','Martam Namdzong','Martam Tsangkhar Monastery','Old Rumtek Monastery','Pabyuk Monastery','Pandam Monastery','Pathing Matsang Monastery','Radong Tensung Monastery','Raloong Monastery','Ray Mindu Katenling Monastery','Rinak Monastery','Rumtek Dharma Chakra Centre','Samdong Mintokgang Monastery','Sang Monastery','Sang-Ngor Monastery (Sa-Ngor)','Simig Monastery','Singtam Monastery','Sumon Thubten Gatsalling Monastery','Taglung Domsumling Monastery','Taktse (Taktse Ani) Gonpa','Thumon Monastery','Tingkye Gonjang Monastery','Tsangek Monastery','Tsuklakhang (Tsulakhang) Monastery / Royal Chapel','Karthok Monastery','Rhenock Monastery','Simik Monastery','Barphog Monastery','Gor Monastery','Hee Gyathang Monastery','Kabi Monastery','Labrang Monastery','Lachen Monastery','Lachen Thangu Monastery','Lachung Monastery','Lingthem (Lingthem Gonpa)','Malam Monastery','Nage Monastery','Phensang Monastery','Phodong (Karma Tashi Chokhorling) Monastery','Ringyim Monastery','Shagyong Monastery','Ship Kunzang Choling Monastery','Silem Phagyal Monastery','Singchit Ngadag Monastery','Sontam Tensung Monastery','Tareng Gonpa','Tholung Monastery','Tingbung Monastery','Tsawang Choling Monastery','Tsungthang Monastery','Chawayng Ani Monastery','Ben Monastery','Bon Monastery','Bumtar Namdroling Monastery','Burmiok Norbugang Monastery','Doling Monastery','Gagyong Monastery','Kewzing (Kewwzing) Monastery','Linge Phagyal Monastery','Malli Tashi Chodarling Monastery','Mangbro Monastery','Namthang Norbu Tsho-Ling Monastery','Namthang Nyima Choling Monastery','Namtse Ahaley Monastery','Namtse Nga-Dag Monastery','Parbing Monastery','Rabong Kunphenling Tsechu Monastery','Rabong Monastery','Ralong Monastery','Ralong Palchen Choling Monastery','Sangmo Sharchog Bephug Monastery','Serdup Choling Monastery','Sorok Tamang Monastery','Suiram Risung Monastery','Tekling Dzokchen Monastery','Wok Pabong Monastery','Yangang Changchub Tamu Monastery','Yangang Gonpa','Namchi Monastery (Decchen Choyling Gumpa)','Tendong Gumpa','Aden Wolung Monastery','Chakung Monastery','Dodak Tamu Monastery','Dubde Monastery','Hungri Monastery','Khachoedpalri (Khecheopalri) Monastery','Lhuntse Monastery','Melli-Atsing Monastery','Nubling Monastery','Okhrey / Okhery Monastery','Pemayangtse Monastery','Rinchen Choling Tamu Monastery','Rinchenpung (Rinchenpong) Monastery','Sanga Choeling Monastery','Silnon (Sinon) Monastery','Sri Badam Monastery','Tashi Samboling Tamang Monastery','Tashiding Monastery','Bermiok Monastery'
];

let MONASTERIES_INDEX = 0;
const MONASTERIES_IMAGES = [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80'
];

// Cache-buster to ensure updated local images show immediately per page load
const IMAGE_CACHE_BUSTER = Date.now();
function withCacheBuster(url) {
    if (typeof url !== 'string') return url;
    // Append once per page load for local asset paths
    if (url.indexOf('assets/') === 0 && url.indexOf('?v=') === -1) {
        return url + (url.includes('?') ? '&' : '?') + 'v=' + IMAGE_CACHE_BUSTER;
    }
    return url;
}

// Paste custom image URLs from your source to override by exact name
// Example:
// "Rumtek Dharma Chakra Centre": "https://example.com/rumtek.jpg",
const MONASTERY_IMAGE_OVERRIDES = {
    // Add entries like: "Pemayangtse Monastery": "https://.../pemayangtse.jpg"
};

// Local filename mappings for images dropped in assets/
Object.assign(MONASTERY_IMAGE_OVERRIDES, {
    'Amba Mamring Monastery': 'assets/Amba mamring.jpg',
    'Sang-Ngor Monastery (Sa-Ngor)': 'assets/ang-Ngor Ngor Gonpa Monastery.jpg',
    'Bakcham Monastery': 'assets/bakcham monastery.jpg',
    'Bongyong Ani Gonpa': 'assets/bonyong ani gonpa.jpg',
    'Burtuk Ugen Pemacholing Monastery': 'assets/Burtuk Ugen Pemacholing Monastery.jpg',
    'Choten Monastery': 'assets/choten.jpg',
    'Dichen Choling Monastery': 'assets/Dichen Choling Monastery.jpg',
    'Dolepchen Boudha Sanskrit Monastery': 'assets/Dolepchen Boudha Sanskrit Monastery.jpg',
    'Dubde Monastery': 'assets/Dubdi Monastery.jpg',
    'Duchi Gyalton Monastery': 'assets/Duchi Gyalton Monaster.jpg',
    'Enchey Monastery': 'assets/Enchey Monastery.jpg',
    'Kagon Tshechhogling Monastery': 'assets/Kagon Tshechhogling Monastery.jpg',
    'Kathog Dorjeden Monastery': 'assets/Kathog Dorjeden Monastery.jpg',
    'Khatek Pema Choling Monastery': 'assets/Khatek Pema Choling Monastery.jpg',
    'Lingdok Tsangkhar Monastery': 'assets/Lingdok Tsangkhar Monastery.jpg',
    'Lingdum (Zurmang) Monastery': 'assets/Lingdum (Zurmang) Monastery.jpg',
    'Linkoed Monastery': 'assets/Linkoed Monastery.jpg',
    'Martam Tsangkhar Monastery': 'assets/Martam Tsangkhar Monastery.jpg',
    'Old Rumtek Monastery': 'assets/Old Rumtek Monastery.jpg',
    'Pabyuk Monastery': 'assets/Pabyuk Monastery.jpg',
    'Pandam Monastery': 'assets/Pandam Monastery.jpg',
    'Pathing Matsang Monastery': 'assets/Pathing Matsang Monastery.jpg',
    'Pemayangtse Monastery': 'assets/Pemayangtse Monastery.jpg',
    'Radong Tensung Monastery': 'assets/Radong Tensung Monastery.jpg',
    'Raloong Monastery': 'assets/Raloong Monastery.jpg',
    'Ralong Monastery': 'assets/Ralong Monastery.jpg',
    'Ray Mindu Katenling Monastery': 'assets/Ray Mindu Katenling Monastery.jpg',
    'Rinak Monastery': 'assets/Rinak Monastery.jpg',
    'Rumtek Dharma Chakra Centre': 'assets/Rumtek Dharma Chakra Centre.jpg',
    'Rumtek Monastery': 'assets/Rumtek Monastery.jpg',
    'Samdong Mintokgang Monastery': 'assets/Samdong Mintokgang Monastery.jpg',
    'Sang Monastery': 'assets/Sang Monastery.jpg',
    'Simig Monastery': 'assets/Simig Monastery.jpg',
    'Singtam Monastery': 'assets/Singtam Karma Thuje Choling Monastery.jpg',
    'Sumon Thubten Gatsalling Monastery': 'assets/Sumon Thubten Gatsalling Monastery.jpg',
    'Taglung Domsumling Monastery': 'assets/Taglung Domsumling Monastery.jpg',
    'Taktse (Taktse Ani) Gonpa': 'assets/Taktse Ani Gonpa Ugen Chokhorling.jpg',
    'Tashiding Monastery': 'assets/Tashiding Monastery.jpg',
    'Thumon Monastery': 'assets/Thumon Monastery.jpg',
    'Tingkye Gonjang Monastery': 'assets/Tingkye Gonjang Monastery.jpg',
    'Tsangek Monastery': 'assets/Tsangek Monastery.jpg',
    'Tsuklakhang (Tsulakhang) Monastery / Royal Chapel': 'assets/Tsulakhang Monastery.jpg',
    'Karthok Monastery': 'assets/Kartok Monastery.jpg',
    'Lachen Monastery': 'assets/Lachen Monastery.jpg',
    'Lachung Monastery': 'assets/Lachung Monastery.jpg'
});

function getOverrideForName(name) {
    if (MONASTERY_IMAGE_OVERRIDES[name]) return MONASTERY_IMAGE_OVERRIDES[name];
    const lower = name.toLowerCase();
    for (const key in MONASTERY_IMAGE_OVERRIDES) {
        if (key.toLowerCase() === lower) return MONASTERY_IMAGE_OVERRIDES[key];
    }
    return null;
}

function pickMonasteryImage(name, idx) {
        const overridden = getOverrideForName(name);
        if (overridden) return withCacheBuster(overridden);
        const lower = name.toLowerCase();
        if (lower.includes('lachen')) return withCacheBuster('assets/Lachen Monastery.jpg');
        if (lower.includes('lachung')) return withCacheBuster('assets/Lachung Monastery.jpg');
        if (lower.includes('pemayangtse')) return withCacheBuster('assets/Pemayangtse Monastery.jpg');
        if (lower.includes('tashiding')) return withCacheBuster('assets/Tashiding Monastery.jpg');
        return MONASTERIES_IMAGES[idx % MONASTERIES_IMAGES.length];
    }

function slugify(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function appendMonasteriesBatch(batchSize) {
    const grid = document.getElementById('monasteries-grid');
    if (!grid) return true;
    const fragment = document.createDocumentFragment();
    const start = MONASTERIES_INDEX;
    const end = Math.min(MONASTERIES_MASTER.length, start + batchSize);
    for (let i = start; i < end; i++) {
        const name = MONASTERIES_MASTER[i];
        const exists = Array.from(grid.querySelectorAll('.monastery-card h3')).some(h => h.textContent.trim().toLowerCase() === name.toLowerCase());
        if (exists) continue;

        // Only include monasteries that have an explicit provided image mapping
        const override = getOverrideForName(name);
        if (!override) continue;

        const card = document.createElement('div');
        card.className = 'monastery-card card-hover';
        card.setAttribute('data-region', '');
        card.setAttribute('data-popularity', 'medium');
        card.setAttribute('data-age', 'medieval');

        const img = document.createElement('img');
        img.src = withCacheBuster(override);
        img.alt = name;
        img.loading = 'lazy';

        const content = document.createElement('div');
        content.className = 'p-6';

        const h3 = document.createElement('h3');
        h3.className = 'text-xl font-bold mb-2';
        h3.textContent = name;

        const p = document.createElement('p');
        p.className = 'text-gray-600 mb-4';
        p.textContent = 'Explore this monastery\'s unique heritage, rituals, and serene surroundings.';

        const footer = document.createElement('div');
        footer.className = 'flex items-center justify-between';

        const meta = document.createElement('span');
        meta.className = 'text-sm text-gray-500';
        meta.textContent = 'Sikkim • Heritage Site';

        const link = document.createElement('a');
        link.className = 'bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition duration-300';
        link.href = 'monastery-detail.html?id=' + slugify(name);
        link.textContent = 'View Details';

        footer.appendChild(meta);
        footer.appendChild(link);
        content.appendChild(h3);
        content.appendChild(p);
        content.appendChild(footer);

        card.appendChild(img);
        card.appendChild(content);
        fragment.appendChild(card);
    }
    grid.appendChild(fragment);
    MONASTERIES_INDEX = end;
    return MONASTERIES_INDEX < MONASTERIES_MASTER.length;
}

