// Some extra needed JS for our timeline to properly scroll 

(function () {
    const wide = document.querySelector("#timeline .timeline-wide");
    const viewport = document.querySelector("#timeline .timeline-viewport");
    const track = document.querySelector("#timeline .timeline-track");
    const progress = document.querySelector("#timeline .timeline-progress-bar");

    if (!wide || !viewport || !track) return;

    // On smaller screens, show progress as the user swipes sideways.
    function updateManualProgress() {
        if (viewport.classList.contains("is-gsap-active")) return;
        const total = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const ratio = total ? viewport.scrollLeft / total : 1;
        if (progress) progress.style.transform = `scaleX(${ratio})`;
    }
    viewport.addEventListener("scroll", updateManualProgress, { passive: true });
    updateManualProgress();

    // If the scripts for GSAP don't load, the timeline is still usable via swipe
    if (!window.gsap || !window.ScrollTrigger) {
        console.warn("GSAP unavailable; timeline can still scroll sideways.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
        const travel = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (travel() <= 10) return;

        viewport.classList.add("is-gsap-active");
        wide.classList.add("gsap-enabled");
        viewport.scrollLeft = 0;

        const animation = gsap.to(track, {
            x: () => -travel(),
            ease: "none",
            scrollTrigger: {
                trigger: viewport,
                start: "top 90px", // Leaves room for the navbar
                end: () => "+=" + Math.max(1, Math.round(travel() * 0.8)),
                pin: true,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    if (progress) progress.style.transform = `scaleX(${self.progress})`;
                }
                // For debugging, temporarily add: markers: true,
            }
        });

        // gsap.matchMedia automatically reverts the animation/ScrollTrigger
        // when the query stops matching (eg changing screen width).
        return () => {
            animation.kill();
            viewport.classList.remove("is-gsap-active");
            wide.classList.remove("gsap-enabled");
            gsap.set(track, { clearProps: "transform" });
            updateManualProgress();
        };
    });

    // Font loading and image loading can change the measured scroll distance.
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();