## 2024-05-18 - Optimized Array Lookups in Render Loops
 **Learning:** Using `Array.prototype.find` inside a `.map` loop creates a nested loop scenario ($O(N \times M)$) which can severely impact rendering performance, especially for larger arrays.
 **Action:** We mapped the source array (e.g. `NC_HOSPITAL_SEEDS`) to a `Map` structure upfront (outside the component) allowing for rapid $O(1)$ constant-time lookups using `.get()` during the render loop.
