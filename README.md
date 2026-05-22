# Centr Invest (Expo / React Native)

Мобильное приложение на **Expo (React Native)** с использованием **NativeWind (TailwindCSS)**.

## Требования

- Node.js (LTS) + npm
- Git
- Android Studio (для Android-эмулятора)

## Установка

```bash
cd centr-invest-app
npm install
```

## Запуск

Запуск проекта:

```bash
cd centr-invest-app
npx expo start --localhost
```

Дальше:
- `a` — открыть на Android (эмулятор/устройство)
- `w` — открыть Web

## Настройка Android Emulator в Android Studio

1. Установи **Android Studio**.
2. Открой **Tools → SDK Manager**:
   - вкладка **SDK Platforms**: установи актуальную версию Android (например, 14/15) и `Android SDK Platform`.
   - вкладка **SDK Tools**: включи/установи:
     - **Android SDK Platform-Tools**
     - **Android SDK Build-Tools**
     - **Android Emulator**
3. Создай виртуальное устройство:
   - **Tools → Device Manager → Create device**
   - выбери устройство (например, Pixel) → **Next**
   - выбери System Image (рекомендуется **x86_64** / **Google APIs**) → **Download** → **Finish**
4. Запусти эмулятор из **Device Manager** (кнопка ▶ рядом с AVD).
   
Если эмулятор не стартует или работает очень медленно, проверь, что включена аппаратная виртуализация:
- в BIOS/UEFI: **Intel VT-x / AMD-V**
- в Windows: включены компоненты виртуализации (часто помогает включить **Windows Hypervisor Platform** / **Hyper-V**, зависит от конфигурации)
5. Проверь, что `adb` доступен:

```bash
adb devices
```

Если `adb` не находится, добавь в `PATH` папку `platform-tools`, обычно:
- Windows: `%LOCALAPPDATA%\Android\Sdk\platform-tools`
- macOS: `~/Library/Android/sdk/platform-tools`
- Linux: `~/Android/Sdk/platform-tools`

## Запуск на Android-эмуляторе

1. Запусти эмулятор.
2. В другом терминале запусти Metro:

```bash
cd centr-invest-app
npx expo start --localhost
```

3. Нажми `a` в терминале Expo, либо открой Android Studio → **Running Devices** и убедись, что эмулятор запущен.

## Полезно знать

- `--localhost` подходит, когда эмулятор запущен на этом же компьютере.
- Если запускаешь на реальном телефоне и есть проблемы с доступом, попробуй `npx expo start --tunnel` (медленнее, но стабильнее).
