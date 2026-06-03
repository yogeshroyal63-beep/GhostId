from app.core.config import settings


def get_tier(score: float) -> tuple[str, str]:
    if score >= settings.silent_pass_threshold:
        return "SILENT_PASS", "log_only"
    if score >= settings.soft_nudge_threshold:
        return "SOFT_NUDGE", "one_tap_confirm"
    if score >= settings.typing_challenge_threshold:
        return "TYPING_CHALLENGE", "randomized_phrase"
    return "HARD_STOP", "sdk_callback"


def should_update_baseline(score: float) -> bool:
    return score >= settings.silent_pass_threshold
