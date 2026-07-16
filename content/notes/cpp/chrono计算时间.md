---
title: chrono计算时间
date: 2025-07-17 19:41:51
sticky: 1
categories:
    - cpp
tags:
    - cpp
disableNunjucks: true
---

---

## 计算时间

```
        auto start_time = std::chrono::steady_clock::now();
        CameraHandler();
        auto current_time = std::chrono::steady_clock::now();
        auto time = std::chrono::duration_cast<std::chrono::milliseconds>(current_time - start_time).count();
        
        std::cout << "Duration: " << time << " ms" << std::endl;
        printf("*************** time elapsed = %lld ms\n", time);
```

