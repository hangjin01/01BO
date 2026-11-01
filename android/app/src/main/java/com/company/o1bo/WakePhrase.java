package com.company.o1bo;

/** Conservative exact phrase matching: no transcript is retained. */
public final class WakePhrase {
    private WakePhrase() {}
    public static boolean matches(String text) {
        return text != null && text.replaceAll("[\\s\\p{Punct}]", "").equals("제로보");
    }
}
