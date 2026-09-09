export const ppt_arr = [
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_a50ac529-616f-4e8c-85be-4915817c0ef2.html",
    html: `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>大模型商业应用解析</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
      <style>
          body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              font-family: 'Noto Sans SC', sans-serif;
          }
          .slide {
              width: 1280px;
              min-height: 720px;
              position: relative;
              background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
              overflow: hidden;
          }
          .grid-pattern {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: 
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
              background-size: 40px 40px;
              z-index: 1;
          }
          .circle-decoration {
              position: absolute;
              border-radius: 50%;
              background: rgba(255,255,255,0.05);
              z-index: 1;
          }
          .main-title {
              font-size: 72px;
              font-weight: 900;
              letter-spacing: 2px;
              text-shadow: 0 4px 8px rgba(0,0,0,0.3);
              background: linear-gradient(45deg, #ffffff, #99ccff);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: shimmer 3s infinite;
          }
          .subtitle {
              font-size: 32px;
              font-weight: 500;
              letter-spacing: 1px;
              color: rgba(255,255,255,0.9);
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .date-info {
              font-size: 18px;
              font-weight: 400;
              color: rgba(255,255,255,0.7);
          }
          .floating-icon {
              position: absolute;
              opacity: 0.8;
              filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
              animation: float 6s infinite ease-in-out;
          }
          @keyframes shimmer {
              0% { background-position: -500px 0; }
              100% { background-position: 500px 0; }
          }
          @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
          }
          .hexagon {
              position: absolute;
              clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
              background: rgba(255,255,255,0.05);
              z-index: 1;
          }
      </style>
  </head>
  <body>
      <div class="slide flex items-center justify-center">
          <!-- 背景网格 -->
          <div class="grid-pattern"></div>
          
          <!-- 装饰元素 -->
          <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
          <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
          
          <!-- 六边形装饰 -->
          <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
          <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
          <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
          
          <!-- 浮动图标 -->
          <div class="floating-icon" style="top: 150px; left: 180px;">
              <i class="fas fa-brain text-blue-200 text-4xl"></i>
          </div>
          <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
              <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
          </div>
          <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
              <i class="fas fa-cogs text-blue-200 text-4xl"></i>
          </div>
          
          <!-- 主要内容区 -->
          <div class="z-10 text-center px-6">
              <h1 class="main-title mb-8">大模型商业应用解析</h1>
              <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
              <p class="date-info mt-16">2025年</p>
          </div>
          
          <!-- 右下角装饰 -->
          <div class="absolute bottom-6 right-10 flex items-center">
              <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
              <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
          </div>
      </div>
  </body>
  </html>
  `,
    think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_d2e9a7bd-8b06-4704-8b94-00d0b4a5ab20.html?pageIndex=1&scale=0.6421875",
    html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
    think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_08b0b33e-953c-45df-8769-f17f05ab7a7f.html?pageIndex=3&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_4df1f2a4-b099-4991-9b80-e5b11713e0bf.html?pageIndex=4&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_e94a9786-54fb-45d5-ab40-19a7ce4c6cba.html?pageIndex=5&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_92276f4a-63f6-4060-893b-dda851be6296.html?pageIndex=6&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_81e83ac7-362f-40e8-98cc-0cc4ca30a0e8.html?pageIndex=7&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
  {
    url: "https://page1.genspark.site/slide_agent/d94f76a4-bb5e-4254-823f-6f259966ecd7/large_language_model_business_application_be27e4d3-8cb9-4bc6-8407-3e542b60cfb6.html?pageIndex=8&scale=0.85625",
     html: `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大模型商业应用解析</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .slide {
                width: 1280px;
                min-height: 720px;
                position: relative;
                background: linear-gradient(135deg, #0c1e5a 0%, #0a4a9f 50%, #0574c1 100%);
                overflow: hidden;
            }
            .grid-pattern {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 40px 40px;
                z-index: 1;
            }
            .circle-decoration {
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
            .main-title {
                font-size: 72px;
                font-weight: 900;
                letter-spacing: 2px;
                text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #ffffff, #99ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmer 3s infinite;
            }
            .subtitle {
                font-size: 32px;
                font-weight: 500;
                letter-spacing: 1px;
                color: rgba(255,255,255,0.9);
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .date-info {
                font-size: 18px;
                font-weight: 400;
                color: rgba(255,255,255,0.7);
            }
            .floating-icon {
                position: absolute;
                opacity: 0.8;
                filter: drop-shadow(0 0 8px rgba(0,150,255,0.6));
                animation: float 6s infinite ease-in-out;
            }
            @keyframes shimmer {
                0% { background-position: -500px 0; }
                100% { background-position: 500px 0; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            .hexagon {
                position: absolute;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                background: rgba(255,255,255,0.05);
                z-index: 1;
            }
        </style>
    </head>
    <body>
        <div class="slide flex items-center justify-center">
            <!-- 背景网格 -->
            <div class="grid-pattern"></div>
            
            <!-- 装饰元素 -->
            <div class="circle-decoration" style="width: 500px; height: 500px; top: -100px; right: -100px; opacity: 0.2;"></div>
            <div class="circle-decoration" style="width: 300px; height: 300px; bottom: -50px; left: -50px; opacity: 0.15;"></div>
            
            <!-- 六边形装饰 -->
            <div class="hexagon" style="width: 120px; height: 140px; top: 180px; left: 200px;"></div>
            <div class="hexagon" style="width: 80px; height: 90px; top: 120px; right: 250px;"></div>
            <div class="hexagon" style="width: 100px; height: 110px; bottom: 150px; right: 180px;"></div>
            
            <!-- 浮动图标 -->
            <div class="floating-icon" style="top: 150px; left: 180px;">
                <i class="fas fa-brain text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="bottom: 180px; right: 220px; animation-delay: 1s;">
                <i class="fas fa-chart-line text-blue-200 text-4xl"></i>
            </div>
            <div class="floating-icon" style="top: 200px; right: 300px; animation-delay: 2s;">
                <i class="fas fa-cogs text-blue-200 text-4xl"></i>
            </div>
            
            <!-- 主要内容区 -->
            <div class="z-10 text-center px-6">
                <h1 class="main-title mb-8">大模型商业应用解析</h1>
                <p class="subtitle mb-6">引领智能创新 · 驱动商业价值</p>
                <p class="date-info mt-16">2025年</p>
            </div>
            
            <!-- 右下角装饰 -->
            <div class="absolute bottom-6 right-10 flex items-center">
                <i class="fas fa-robot text-blue-200 text-2xl mr-2"></i>
                <span class="text-blue-200 text-lg font-medium">AI 赋能未来</span>
            </div>
        </div>
    </body>
    </html>
    `,
       think: `我需要为大模型商业应用解析PPT创建第2页目录页。目录应该列出整个PPT的主要内容板块，包括大模型概述、市场前景、行业应用案例、落地策略和未来发展趋势等部分。

基于第1页的设计风格，我将保持科技感强的蓝色设计风格，同时为目录页设计一个清晰的结构。

以下是我计划包含在目录中的主要内容板块：
## 大模型概述
- 定义与特点
- 技术原理
- 发展历程

## 市场前景与规模
- 全球市场规模
- 中国市场潜力
- 投资与融资情况

## 行业应用案例
- 金融行业应用
- 医疗健康领域
- 零售与电商
- 制造业转型
- 教育与内容创作

## 落地策略与实施路径
- 技术选型与评估
- 数据与资源准备
- 成本控制与ROI分析
- 团队建设与人才培养

## 未来发展趋势
- 技术演进方向
- 商业模式创新
- 潜在挑战与解决方案`,
  },
];
