import React, { useState } from "react";
import styles from "../NewAnalysis.module.css";

const OverlayModal = ({
  isOpen,
  onClose,
  preview,
  processedMask,
}) => {
  const [sliderVal, setSliderVal] =
    useState(50);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlayModal}
      onMouseDown={onClose}
    >
      <div
        className={
          styles.overlayModalCard
        }
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <div
          className={
            styles.overlayModalHeader
          }
        >
          <h2>
            MR ve AI Segmentasyon
          </h2>

          <button
            type="button"
            className={
              styles.overlayModalClose
            }
            onClick={onClose}
            aria-label="Kapat"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          className={
            styles.overlayModalStage
          }
        >
          <div
            className={
              styles.sliderContainer
            }
          >
            <img
              src={preview}
              alt="Orijinal MR"
              className={
                styles.sliderImgBase
              }
            />

            {processedMask && (
              <>
                <div
                  className={
                    styles.sliderOverlay
                  }
                  style={{
                    clipPath: `inset(0 ${
                      100 - sliderVal
                    }% 0 0)`,
                  }}
                >
                  <img
                    src={processedMask}
                    alt="AI Segmentasyon"
                    className={
                      styles.sliderImgMask
                    }
                  />
                </div>

                <div
                  className={
                    styles.sliderLine
                  }
                  style={{
                    left: `${sliderVal}%`,
                  }}
                />
              </>
            )}

            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={(e) =>
                setSliderVal(
                  Number(e.target.value),
                )
              }
              className={
                styles.sliderControl
              }
              aria-label="Görüntü karşılaştırma oranı"
            />

            <div
              className={
                styles.sliderLabels
              }
            >
              <span
                className={
                  styles.labelOrijinal
                }
              >
                Orijinal MR
              </span>

              <span
                className={
                  styles.labelMaske
                }
              >
                AI Segmentasyon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayModal;