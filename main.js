document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabsBg = document.getElementById('tabsBg');
  
    // Устанавливаем фон для первого (активного) таба без анимации
    const firstActiveTab = document.querySelector('.tab-content.active');
    if(firstActiveTab) {
      const firstBg = firstActiveTab.getAttribute('data-bg');
      tabsBg.style.backgroundImage = `url(${firstBg})`;
    }
  
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Переключаем активное состояние кнопок
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
  
        // Переключаем вкладки по индексу
        const index = btn.getAttribute('data-index');
        tabContents.forEach(content => content.classList.remove('active'));
        const activeTab = tabContents[index];
        activeTab.classList.add('active');
  
        // Получаем новый фоновый URL из data-bg активной вкладки
        const newBg = activeTab.getAttribute('data-bg');
  
        // Если фон отличается от уже установленного - запускаем анимацию
        // Получим текущий фон (удаляем возможные кавычки)
        const currentBg = tabsBg.style.backgroundImage.replace(/url\(("|')?(.*?)(\1)?\)/, '$2');
  
        if (newBg !== currentBg) {
          // Создадим оверлей для плавного перехода
          const overlay = document.createElement('div');
          overlay.className = 'tabs-bg-overlay';
          overlay.style.backgroundImage = `url(${newBg})`;
          // Добавляем оверлей в контейнер (на том же уровне, что и tabsBg)
          tabsBg.parentNode.appendChild(overlay);
  
          // Ожидаем следующий кадр для запуска перехода (переключение opacity)
          requestAnimationFrame(() => {
            overlay.style.opacity = '1';
          });
  
          // По завершению перехода (0.5с) обновляем фон основного блока и удаляем оверлей
          setTimeout(() => {
            tabsBg.style.backgroundImage = `url(${newBg})`;
            overlay.remove();
          }, 500);
        }
      });
    });
  });
document.addEventListener('DOMContentLoaded', function() {
    // 1. Предзагрузка всех фоновых изображений
    const slides = document.querySelectorAll('.swiper-slide');
    const imagesToLoad = [];
    
    slides.forEach(slide => {
        const bgImage = slide.getAttribute('data-bg');
        if (bgImage) {
            imagesToLoad.push(new Promise((resolve) => {
                const img = new Image();
                img.src = bgImage;
                img.onload = resolve;
                img.onerror = resolve; // На случай ошибки загрузки
            }));
        }
    });

    // 2. Инициализация Swiper после загрузки изображений
    Promise.all(imagesToLoad).then(() => {
        const swiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: false,
            effect: 'slide',
            speed: 500,
            touchRatio: 1,
            threshold: 10,
            slidesPerView: 1,
            spaceBetween: 0,
            
            // Важные настройки пагинации
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
                dynamicBullets: false
            },
            
            // Навигационные кнопки (если используются)
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            on: {
                init: function() {
                    const container = document.querySelector('.swiper-container');
                    const firstSlide = this.slides[this.activeIndex];
                    const bgImage = firstSlide.getAttribute('data-bg');
                    
                    if (bgImage) {
                        container.style.backgroundImage = `url(${bgImage})`;
                        container.style.opacity = 1;
                    }
                    
                    // Принудительно обновляем пагинацию
                    this.pagination.init();
                    this.pagination.render();
                    this.pagination.update();
                },
                
                slideChangeTransitionStart: function() {
                    const nextSlide = this.slides[this.activeIndex];
                    const bgImage = nextSlide.getAttribute('data-bg');
                    
                    if (bgImage) {
                        document.querySelector('.swiper-container').style.backgroundImage = `url(${bgImage})`;
                    }
                }
            }
        });
    });
});
async function initializeLocalization() {
    async function loadTranslations(language) {
        const response = await fetch(`./${language}.json`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки файла ${language}.json: ${response.statusText}`);
        }
        return await response.json();
    }

    function translatePage(translations) {
        // Обработка обычных текстовых элементов
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.innerHTML = translations[key];
                }
            } else {
                console.warn(`Перевод для ключа '${key}' не найден`);
            }
        });

        // Обработка специальных атрибутов (placeholder, title и т.д.)
        const attrElements = document.querySelectorAll('[data-i18n-placeholder]');
        attrElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            } else {
                console.warn(`Перевод для placeholder ключа '${key}' не найден`);
            }
        });
    }

    function switchLogo(language) {
        const logos = [
            ...document.querySelectorAll('.header-logo'),
            ...document.querySelectorAll('.header-mobile-logo'),
            ...document.querySelectorAll('.footer-logo')
        ];
        
        logos.forEach(logo => {
            if (!logo) {
                console.warn('Логотип не найден');
                return;
            }

            if (language === 'en') {
                logo.src = "./images/logo-eng.png";
                logo.setAttribute('data-lang', 'en');
            } else {
                logo.src = "./images/ekvant-logo.png";
                logo.setAttribute('data-lang', 'ru');
            }
        });
    }

    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) {
        console.error("Элемент language-select не найден!");
        return;
    }

    const currentLanguage = localStorage.getItem('language') || 'ru';
    document.body.style.opacity = '0';

    try {
        const translations = await loadTranslations(currentLanguage);
        translatePage(translations);
        switchLogo(currentLanguage);

        document.body.style.transition = 'opacity 1.5s';
        document.body.style.opacity = '1';

        languageSelect.addEventListener('change', async () => {
            const selectedLanguage = languageSelect.value;
            document.body.style.opacity = '0';

            try {
                const translations = await loadTranslations(selectedLanguage);
                translatePage(translations);
                await new Promise(resolve => setTimeout(resolve, 500));
                switchLogo(selectedLanguage);

                document.body.style.transition = 'opacity 0.5s';
                document.body.style.opacity = '1';
                localStorage.setItem('language', selectedLanguage);
                localStorage.setItem('selectedLanguage', selectedLanguage);
            } catch (error) {
                console.error("Ошибка при смене языка:", error);
                document.body.style.opacity = '1';
            }
        });

        if (localStorage.getItem('selectedLanguage')) {
            languageSelect.value = localStorage.getItem('selectedLanguage');
        } else {
            languageSelect.value = currentLanguage;
        }
    } catch (error) {
        console.error("Произошла ошибка при инициализации локализации:", error);
        document.body.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeLocalization();
});
// Функция загрузки HTML
function loadHTML(url, elementId, callback) {
            fetch(url)
            
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ошибка загрузки ${url}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(data => {
                    const element = document.getElementById(elementId);
                    if (!element) {
                        console.error(`Элемент с id "${elementId}" не найден.`);
                        return;
                    }
                    element.innerHTML = data;
                    
                    // Если загружаем header
                    if (elementId === 'header') {
                        const path = window.location.pathname;
                        const filename = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
                        
                        // Добавляем класс "diff" на всех страницах кроме index.html
                        if (filename && filename !== "index.html") {
                            const headerContainer = document.querySelector('.header-container');
                            if (headerContainer) {
                                headerContainer.classList.add("diff");
                            }
                        }
                        
                        // Инициализируем бургер-меню
                        initializeBurgerMenu();
                        
                        // Устанавливаем активный класс после загрузки
                        setActiveLink();
                        
                        // Вызываем callback
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                    
                    // Если загружаем footer
                    if (elementId === 'footer') {
                        const scrollButton = document.getElementById("scrollToTop");
                        if (scrollButton) {
                            scrollButton.addEventListener("click", function() {
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                            });
                        }
                    }
                })
                .catch(error => console.error(`Ошибка загрузки файла ${url}:`, error));
}
// Загружаем header и footer
loadHTML('./header.html', 'header', initializeLocalization);
loadHTML('./footer.html', 'footer');
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем оба слайдера
    initSlider('.slider-container'); // Десктопный слайдер
    initSlider('.slider-mobile-container'); // Мобильный слайдер

    function initSlider(containerClass) {
        const container = document.querySelector(containerClass);
        if (!container) return;

        const slider = container.querySelector('.slider');
        const slides = container.querySelectorAll('.slide');
        const prevButton = container.querySelector('.prev');
        const nextButton = container.querySelector('.next');

        let index = 0;
        let autoPlayInterval;
        let touchStartX = 0;
        let touchEndX = 0;
        let wasManuallyChanged = false; // Флаг первого ручного изменения

        // Инициализация слайдера
        function init() {
            if (!slider || slides.length === 0) return;
            
            updateSlider();
            setupEventListeners();
            
            // Автоплей запустится только после первого ручного изменения
        }

        function updateSlider() {
            slider.style.transform = `translateX(-${index * 100}%)`;
        }

        function nextSlide() {
            index = (index + 1) % slides.length;
            updateSlider();
            checkFirstInteraction();
        }

        function prevSlide() {
            index = (index - 1 + slides.length) % slides.length;
            updateSlider();
            checkFirstInteraction();
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        }

        function checkFirstInteraction() {
            if (!wasManuallyChanged) {
                wasManuallyChanged = true;
                startAutoPlay(); // Запускаем автоплей только после первого ручного изменения
            }
        }

        function setupEventListeners() {
            // Кнопки навигации
            if (nextButton) {
                nextButton.addEventListener('click', handleNextClick);
            }

            if (prevButton) {
                prevButton.addEventListener('click', handlePrevClick);
            }

            // Свайп для мобильных устройств
            slider.addEventListener('touchstart', handleTouchStart, { passive: true });
            slider.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        function handleNextClick() {
            stopAutoPlay();
            nextSlide();
            if (wasManuallyChanged) startAutoPlay();
        }

        function handlePrevClick() {
            stopAutoPlay();
            prevSlide();
            if (wasManuallyChanged) startAutoPlay();
        }

        function handleTouchStart(event) {
            touchStartX = event.touches[0].clientX;
            stopAutoPlay();
        }

        function handleTouchEnd(event) {
            touchEndX = event.changedTouches[0].clientX;
            handleSwipe();
        }

        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            if (diff > 50) {
                nextSlide();
            } else if (diff < -50) {
                prevSlide();
            }
            if (wasManuallyChanged) startAutoPlay();
        }

        // Запускаем инициализацию
        init();
    }
});
document.addEventListener("DOMContentLoaded", function(){
  var phoneInput = document.getElementById("phone");
  Inputmask({
    mask: "+7 (999) 999-99-99",
    showMaskOnHover: false,
    showMaskOnFocus: true,
    placeholder: "_"
  }).mask(phoneInput);
});

document.addEventListener("DOMContentLoaded", function(){
  const scrollButton = document.getElementById("scrollToTop");
  
  // Добавляем проверку на null
  if (scrollButton) {
    scrollButton.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  } else {
    console.warn("Элемент с id='scrollToTop' не найден в DOM");
  }
});

// Функция для установки активного класса
function setActiveLink() {
    const navigationLinks = document.querySelectorAll('.navigation a');
    
    // Убираем активный класс у всех ссылок
    navigationLinks.forEach(link => link.classList.remove('active'));
    
    // Получаем текущий URL
    const currentPath = window.location.pathname;
    
    // Проверяем все ссылки
    navigationLinks.forEach(link => {
        // Получаем путь из href
        const linkPath = new URL(link.href).pathname;
        
        // Если путь совпадает с текущим URL
        if (linkPath === currentPath || 
            (currentPath === '/' && linkPath === '/index.html')) {
            link.classList.add('active');
        }
    });
}

// Добавляем обработчики кликов после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики кликов ко всем ссылкам навигации
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('navigation') || 
            e.target.closest('.navigation a')) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            const navigationLinks = document.querySelectorAll('.navigation a');
            navigationLinks.forEach(link => link.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке
            const targetLink = e.target.closest('a');
            if (targetLink) {
                targetLink.classList.add('active');
                
                // Переходим по ссылке
                window.location.href = targetLink.href;
            }
        }
    });
});

// Функция инициализации бургер-меню
function initializeBurgerMenu() {
 const burgerIcon = document.getElementById('burgerIcon');
 const burgerMenu = document.getElementById('burgerMenu');
 
 if (burgerIcon && burgerMenu) {
 burgerIcon.addEventListener('click', () => {
 burgerIcon.classList.toggle('active');
 burgerMenu.classList.toggle('active');
 });
 
 // Добавляем обработчик клика вне меню
 document.addEventListener('click', (e) => {
 const target = e.target;
 const isBurgerIcon = target === burgerIcon || burgerIcon.contains(target);
 const isBurgerMenu = target === burgerMenu || burgerMenu.contains(target);
 const isMenuActive = burgerMenu.classList.contains('active');
 
 if (!isBurgerIcon && !isBurgerMenu && isMenuActive) {
 burgerIcon.classList.remove('active');
 burgerMenu.classList.remove('active');
 }
 });
 }
}

// Загружаем header и footer
loadHTML('./header.html', 'header', initializeLocalization);
loadHTML('./footer.html', 'footer',initializeLocalization);

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    let index = 0;
    let autoPlayInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    function updateSlider() {
        slider.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        index = (index + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        index = (index - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 3000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    nextButton.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        // startAutoPlay();
    });

    // Свайп для мобильных устройств
    slider.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
    });

    slider.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            stopAutoPlay();
            nextSlide();
            startAutoPlay();
        } else if (touchStartX - touchEndX < -50) {
            stopAutoPlay();
            prevSlide();
            startAutoPlay();
        }
    }
});


document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("modal");
    const modalMessage = document.querySelector(".modal-message");
    const closeBtn = document.querySelector(".close");

    // Функция для обработки отправки формы
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Отправляем данные через AJAX
        const formData = new FormData(form);
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });
            
            if (response.ok) {
                showModal("success", form.id);
                form.reset();
            } else {
                showModal("error", form.id);
            }
        } catch (error) {
            showModal("error", form.id);
        }
    }

    // Функция показа модального окна
    function showModal(type, formId) {
        modal.style.display = "block";
        
        if (type === "success") {
            modalMessage.textContent = "Success!";
            modalMessage.style.color = "green";
        } else {
            modalMessage.textContent = `Error submitting form ${formId}!`;
            modalMessage.style.color = "red";
        }
    }

    // Находим обе формы и добавляем обработчики
    const formMail = document.getElementById("FormMail");
    const formProducts = document.getElementById("FormProducts");
    
    if (formMail) {
        formMail.addEventListener("submit", handleFormSubmit);
    }
    
    if (formProducts) {
        formProducts.addEventListener("submit", handleFormSubmit);
    }

    // Закрытие модального окна
    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Закрытие при клике вне модального окна
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Получаем все ссылки навигации
    const navigationLinks = document.querySelectorAll('.navigation a');
    
    // Проверяем текущую страницу
    const currentPath = window.location.pathname;
    
    // Функция для установки активного класса
    function setActiveLink() {
        navigationLinks.forEach(link => {
            // Убираем активный класс у всех ссылок
            link.classList.remove('active');
            
            // Проверяем, соответствует ли href текущей странице
            if (link.href.includes(currentPath) || 
                (currentPath === '/' && link.href.includes('index.html'))) {
                link.classList.add('active');
            }
        });
    }
    
    // Устанавливаем активный класс при загрузке
    setActiveLink();
    
    // Добавляем обработчики кликов для всех ссылок
    navigationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            navigationLinks.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Переходим по ссылке
            window.location.href = this.href;
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.contact-button');
    const contactItems = document.querySelectorAll('.contact-info-item');
    let isExpanded = false;
    
    button.addEventListener('click', () => {
        if (!isExpanded) {
            button.classList.add('expanded');
            isExpanded = true;
        }
    });
    
    contactItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Сохраняем текст и иконку
            const text = item.textContent.trim();
            const copyIcon = item.querySelector('img');
            
            // Создаем временный input для копирования
            const tempInput = document.createElement('input');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Сохраняем иконку и показываем сообщение
            const icon = copyIcon.outerHTML;
            item.innerHTML = 'Скопировано! ' + icon;
            
            setTimeout(() => {
                item.textContent = text;
                // Возвращаем иконку на место
                item.appendChild(copyIcon);
            }, 1500);
        });
    });
    
    // Добавляем обработчик клика на весь документ
    document.addEventListener('click', (e) => {
        if (!button.contains(e.target) && isExpanded) {
            button.classList.remove('expanded');
            isExpanded = false;
        }
    });
});
//Страница о компании выставки
document.addEventListener('DOMContentLoaded', function () {

    /* ===== POPUP ===== */
    const popup = document.querySelector('.popup');
    const popupImg = document.querySelector('.popup-img');
    const popupImgContainer = document.querySelector('.popup-img-container');
    const closeBtn = document.querySelector('.close-btn');
    const zoomBtn = document.querySelector('.zoom-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;
    let images = [];
    let isZoomed = false;
    let touchStartX = 0;
    let touchEndX = 0;

    function initGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item img');

        images = [];

        galleryItems.forEach((item, index) => {
            images.push({
                src: item.getAttribute('src'),
                alt: item.getAttribute('alt')
            });

            item.onclick = () => {
                currentIndex = index;
                openPopup(currentIndex);
            };
        });
    }

    function openPopup(index) {
        if (images.length === 0) return;
        popupImg.src = images[index].src;
        popupImg.alt = images[index].alt;
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetZoom();
    }

    function closePopup() {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function resetZoom() {
        isZoomed = false;
        popupImg.style.transform = 'scale(1)';
    }

    function toggleZoom() {
        isZoomed = !isZoomed;
        popupImg.style.transform = isZoomed ? 'scale(1.5)' : 'scale(1)';
    }

    function showNext() {
        if (images.length === 0) return;
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    }

    function showPrev() {
        if (images.length === 0) return;
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    }

    function updateImage() {
        popupImg.style.opacity = '0';
        setTimeout(() => {
            popupImg.src = images[currentIndex].src;
            popupImg.style.opacity = '1';
            resetZoom();
        }, 200);
    }

    closeBtn.addEventListener('click', closePopup);
    zoomBtn.addEventListener('click', toggleZoom);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });

    document.addEventListener('keydown', (e) => {
        if (!popup.classList.contains('active')) return;
        if (e.key === 'Escape') closePopup();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    popupImgContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    popupImgContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (isZoomed) return;

        if (touchStartX - touchEndX > 50) showNext();
        if (touchEndX - touchStartX > 50) showPrev();
    });

    /* ===== ТАБЫ ===== */
    const tabs = document.querySelectorAll('.company-tab');

    // Десктопные баннеры
    const banner2026 = document.querySelector('.event2026');
    const banner2025 = document.querySelector('.event2025');

    // Мобильные баннеры
    const bannerMob2026 = document.querySelector('.event-banner-mob-company.event2026');
    const bannerMob2025 = document.querySelector('.event-banner-mob-company.event2025');

    // Секция с галереей
    const gallerySection = document.querySelector('.gallery-event');
    const gallery = document.querySelector('.gallery');

    const content = {
        2026: {
            images: [
                "./images/event2026-photo1.jpg",
                "./images/event2026-photo2.jpg",
                "./images/event2026-photo3.jpg",
                "./images/event2026-photo4.jpg",
                "./images/event2026-photo5.jpg",
                "./images/event2026-photo6.jpg",
                "./images/event2026-photo7.jpg",
                "./images/event2026-photo8.jpg",
                "./images/event2026-photo9.jpg",
                "./images/event2026-photo10.jpg",
                "./images/event2026-photo11.jpg",
                "./images/event2026-photo12.jpg",
            ]
        },

        2025: {
            images: [
                "./images/event-photo.png",
                "./images/event-photo2.jpg",
                "./images/event-photo3.jpg",
                "./images/event-photo4.jpg",
                "./images/event-photo5.jpg",
                "./images/event-photo6.jpg",
                "./images/event-photo7.jpg",
                "./images/event-photo8.jpg",
                "./images/event-photo9.jpg",
                "./images/event-photo10.jpg",
                "./images/event-photo11.jpg",
                "./images/event-photo12.jpg"
            ]
        }
    };

    function changeYear(year) {
        const data = content[year];

        // Показываем/скрываем десктопные баннеры
        if (year === '2026') {
            banner2026.style.display = 'block';
            banner2025.style.display = 'none';
        } else {
            banner2026.style.display = 'none';
            banner2025.style.display = 'block';
        }

        // Показываем/скрываем мобильные баннеры
        if (bannerMob2026 && bannerMob2025) {
            if (year === '2026') {
                bannerMob2026.style.display = 'block';
                bannerMob2025.style.display = 'none';
            } else {
                bannerMob2026.style.display = 'none';
                bannerMob2025.style.display = 'block';
            }
        }

        // Обновляем галерею
        gallery.innerHTML = '';

        data.images.forEach((img) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `<img src="${img}" loading="lazy">`;
            gallery.appendChild(div);
        });

        // Переинициализация галереи
        initGallery();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            changeYear(tab.dataset.year);
        });
    });

    /* старт — показываем 2026, скрываем 2025 */
    changeYear('2026');
});

//Slider для новостей на мобилке 
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("news-slider");
  const cards = Array.from(container.children);
  const totalCards = cards.length;

  // Клонируем первый и последний элементы
  const firstClone = cards[0].cloneNode(true);
  const lastClone = cards[totalCards - 1].cloneNode(true);

  // Добавляем клонированные элементы
  container.insertBefore(lastClone, cards[0]);
  container.appendChild(firstClone);

  const allCards = Array.from(container.children);
  let currentIndex = 1; // начинаем со 2-го элемента (первой настоящей карточки)
  let isAnimating = false;

  // Начальная позиция
  container.style.transform = `translateX(-${currentIndex * 100}%)`;

  const updateSlider = () => {
    container.style.transition = 'transform 0.5s ease-in-out';
    container.style.transform = `translateX(-${currentIndex * 100}%)`;
  };

  const next = () => {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex++;
    updateSlider();
  };

  const prev = () => {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex--;
    updateSlider();
  };

  container.addEventListener('transitionend', () => {
    if (currentIndex === allCards.length - 1) {
      container.style.transition = 'none';
      currentIndex = 1;
      container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    if (currentIndex === 0) {
      container.style.transition = 'none';
      currentIndex = allCards.length - 2;
      container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    isAnimating = false;
  });

  document.getElementById("next-slide").addEventListener("click", next);
  document.getElementById("prev-slide").addEventListener("click", prev);
});

//Пагинация новостей
document.addEventListener("DOMContentLoaded", function () {
  const pageGroups = document.querySelectorAll(".page-group");
  const paginationContainer = document.querySelector(".pagination");
  const paginationPagesContainer = document.querySelector(".pagination-pages");
  const prevBtn = document.querySelector(".prev-pagination");
  const nextBtn = document.querySelector(".next-pagination");

  let currentPage = 1;
  const totalPages = pageGroups.length;

  // Скрываем пагинацию на мобильных
  if (window.innerWidth <= 768) {
    paginationContainer.style.display = "none";
    return;
  }

  // ✅ Показ нужной страницы
  function showPage(page) {
    pageGroups.forEach((group) => {
      const groupPage = parseInt(group.dataset.page);
      if (groupPage === page) {
        group.style.display = "block";
        group.style.opacity = "1";
        group.style.transition = "opacity 0.4s ease";
      } else {
        group.style.display = "none";
        group.style.opacity = "0";
      }
    });

    // Плавная прокрутка вверх
    document.querySelector(".news-page__list").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Обновление активной кнопки
    document
      .querySelectorAll(".pagination-pages .page-btn")
      .forEach((btn) => {
        btn.classList.toggle("active", parseInt(btn.dataset.page) === page);
      });

    // Блокировка стрелок
    prevBtn.classList.toggle("disabled", page === 1);
    nextBtn.classList.toggle("disabled", page === totalPages);

    currentPage = page;
  }

  // ✅ Создание кнопок пагинации
  function createPagination() {
    paginationPagesContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "page-btn";
      btn.dataset.page = i;
      btn.addEventListener("click", () => showPage(i));
      paginationPagesContainer.appendChild(btn);
    }

    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) showPage(currentPage - 1);
    });

    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) showPage(currentPage + 1);
    });
  }

  // ✅ Инициализация
  createPagination();
  showPage(currentPage);
});



