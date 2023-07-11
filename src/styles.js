import { appendStyle } from "./api/utils.js";

export default function loadStyles() {
  appendStyle(`
  .neptune-plugin-card {
    background-color: var(--wave-color-solid-base-brighter, var(--wave-color-opacity-contrast-fill-ultra-thick));
    border: 1px solid var(--wave-color-opacity-contrast-fill-ultra-thin);
    border-radius: 12px;
    min-height: 70px;
    width: 675px;
    padding: 0 15px 0px 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .neptune-plugin-card-content {
    display: flex;
    justify-content: space-between;
  }
  
  .neptune-active-tab {
    color: var(--wave-color-solid-accent-fill);
    box-shadow: 0px 2px var(--cyan-blue);
  }
  
  .neptune-plugin-title {
    font-weight: 600;
    font-size: medium;
  }

  .neptune-switch-checkbox {
    cursor: pointer;
    margin-left: 0.8rem;
    opacity: 0;
    position: absolute;
    z-index: 1;
  }

  .neptune-switch {
    cursor: pointer;
    background-color: var(--glass-white-5);
    border-radius: 28px;
    display: block;
    height: 28px;
    margin-left: 0.8rem;
    min-width: 48px;
    position: relative;
    transition: background-color .25s ease,border-color .25s ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .neptune-switch:after {
    background-color: var(--snow-white);
    border-radius: 50%;
    box-shadow: 0 1px 2px rgb(0 0 0 / 30%);
    content: "";
    display: block;
    height: 24px;
    left: 2px;
    position: absolute;
    top: 2px;
    transition: all .25s ease;
    width: 24px;
  }

  .neptune-switch-checkbox:checked + .neptune-switch:after {
    left: calc(100% - 0.1em);
    transform: translateX(-100%);
  }

  .neptune-switch-checkbox:checked + .neptune-switch {
    background-color: var(--cyan-blue);
    border-color: var(--cyan-blue);
  }
`);
}
